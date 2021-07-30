import { Tag, Utils } from '@ethersphere/bee-js'
import { Presets, SingleBar } from 'cli-progress'
import * as FS from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { join, parse } from 'path'
import { exit } from 'process'
import { pickStamp, printEnrichedStamp } from '../service/stamp'
import { fileExists, isGateway, sleep } from '../utils'
import { stampProperties } from '../utils/option'
import { createSpinner } from '../utils/spinner'
import { createKeyValue, warningSymbol, warningText } from '../utils/text'
import { RootCommand } from './root-command'
import { VerbosityLevel } from './root-command/command-log'

const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '', 10) || 100 * 1000 * 1000 // 100 megabytes

export class Upload extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'upload'

  public readonly aliases = ['up']

  public readonly description = 'Upload file to Swarm'

  @Argument({ key: 'path', description: 'Path to the file or folder', required: true, autocompletePath: true })
  public path!: string

  @Option(stampProperties)
  public stamp!: string

  @Option({ key: 'pin', type: 'boolean', description: 'Persist the uploaded data on the node' })
  public pin!: boolean

  @Option({ key: 'encrypt', type: 'boolean', description: 'Encrypt uploaded data' })
  public encrypt!: boolean

  @Option({
    key: 'size-check',
    type: 'boolean',
    description: 'Check for optimal file or folder sizes before uploading',
    default: true,
  })
  public sizeCheck!: boolean

  @Option({
    key: 'sync',
    type: 'boolean',
    description: 'Wait for chunk synchronization over the network',
  })
  public sync!: boolean

  @Option({
    key: 'drop-name',
    type: 'boolean',
    description: 'Erase file name when uploading a single file',
  })
  public dropName!: boolean

  @Option({
    key: 'sync-polling-time',
    description: 'Waiting time in ms between sync pollings',
    type: 'number',
    default: 500,
  })
  public syncPollingTime!: number

  @Option({
    key: 'sync-polling-trials',
    description: 'After the given trials the sync polling will stop',
    type: 'number',
    default: 15,
  })
  public syncPollingTrials!: number

  @Option({
    key: 'index-document',
    description: 'Default retrieval file on bzz request without provided filepath',
  })
  public indexDocument!: string

  @Option({
    key: 'error-document',
    description: 'Default error file on bzz request without with wrong filepath',
  })
  public errorDocument!: string

  // CLASS FIELDS

  public hash!: string

  public async run(usedFromOtherCommand = false): Promise<void> {
    this.initCommand()

    if (this.hasUnsupportedGatewayOptions()) {
      exit(1)
    }

    await this.handleSyncSupport()

    let url: string
    let tag: Tag | undefined

    if (!this.stamp) {
      if (isGateway(this.beeApiUrl)) {
        this.stamp = '0'.repeat(64)
      } else {
        this.stamp = await pickStamp(this.bee, this.console)
      }
    }

    if (this.sync) {
      tag = await this.bee.createTag()
    }

    if (!FS.existsSync(this.path)) {
      this.console.error(`Given filepath '${this.path}' doesn't exist`)

      exit(1)
    }

    await this.maybeRunSizeChecks()

    const spinner = createSpinner('Uploading files...')

    const uploadingFolder = FS.statSync(this.path).isDirectory()

    if (uploadingFolder && !this.indexDocument && fileExists(join(this.path, 'index.html'))) {
      this.console.info('Setting --index-document to index.html')
      this.indexDocument = 'index.html'
    }

    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      spinner.start()
    }

    try {
      if (uploadingFolder) {
        url = await this.uploadFolder(this.stamp, tag)
      } else {
        url = await this.uploadSingleFile(this.stamp, tag)
      }
    } finally {
      if (spinner.isSpinning) {
        spinner.stop()
      }
    }

    this.console.dim('Data has been sent to the Bee node successfully!')
    this.console.log(createKeyValue('Swarm hash', this.hash))

    this.console.dim('Waiting for file chunks to be synced on Swarm network...')
    //refresh tag before populate tracking

    if (this.sync && tag) {
      tag = await this.bee.retrieveTag(tag.uid)
      const synced = await this.waitForFileSynced(tag)

      if (!synced) return //error message printed before
    }

    this.console.dim('Uploading was successful!')
    this.console.log(createKeyValue('URL', url))

    if (!usedFromOtherCommand) {
      this.console.quiet(this.hash)

      if (!isGateway(this.beeApiUrl) && !this.quiet) {
        printEnrichedStamp(await this.bee.getPostageBatch(this.stamp), this.console)
      }
    }
  }

  /** Init additional properties of class, that are not handled by the CLI framework */
  private initCommand(): void {
    super.init()
  }

  private async uploadFolder(postageBatchId: string, tag?: Tag): Promise<string> {
    this.hash = await this.bee.uploadFilesFromDirectory(postageBatchId, this.path, {
      indexDocument: this.indexDocument,
      errorDocument: this.errorDocument,
      tag: tag && tag.uid,
      pin: this.pin,
      encrypt: this.encrypt,
    })

    return `${this.beeApiUrl}/bzz/${this.hash}/`
  }

  private async uploadSingleFile(postageBatchId: string, tag?: Tag): Promise<string> {
    const { size } = FS.statSync(this.path)
    const readable = FS.createReadStream(this.path)
    const parsedPath = parse(this.path)
    this.hash = await this.bee.uploadFile(postageBatchId, readable, this.dropName ? undefined : parsedPath.base, {
      tag: tag && tag.uid,
      pin: this.pin,
      encrypt: this.encrypt,
      size,
    })

    return `${this.beeApiUrl}/bzz/${this.hash}/`
  }

  /**
   * Waits until the data syncing is successful on Swarm network
   *
   * @param tag had to be attached to the uploaded file
   *
   * @returns whether the file sync was successful or not.
   */
  private async waitForFileSynced(tag: Tag): Promise<boolean> {
    const tagUid = tag.uid
    const pollingTime = this.syncPollingTime
    const pollingTrials = this.syncPollingTrials
    let synced = false
    let syncStatus = 0
    const progressBar = new SingleBar({ clearOnComplete: true }, Presets.rect)

    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      progressBar.start(tag.total, 0)
    }
    for (let i = 0; i < pollingTrials; i++) {
      tag = await this.bee.retrieveTag(tagUid)

      if (syncStatus !== tag.synced) {
        i = 0
        syncStatus = tag.synced
      }

      if (this.curl) {
        this.console.log(`${syncStatus} / ${tag.total}`)
      } else {
        progressBar.update(syncStatus)
      }

      if (syncStatus >= tag.total) {
        synced = true
        break
      }
      await sleep(pollingTime)
    }
    progressBar.stop()

    if (synced) {
      this.console.dim('Data has been synced on Swarm network')

      return true
    } else {
      this.console.error('Data syncing timeout.')

      return false
    }
  }

  private async maybeRunSizeChecks(): Promise<void> {
    if (!this.sizeCheck) {
      return
    }
    const { size, isDirectory } = await this.getUploadableInfo()

    if (size < MAX_UPLOAD_SIZE) {
      return
    }

    const message = `${isDirectory ? 'Folder' : 'File'} size is larger than recommended value.`

    if (this.quiet) {
      this.console.error(message)
      this.console.error('Pass --size-check false to ignore this warning.')
      exit(1)
    }
    const confirmation = await this.console.confirm(message + ' Do you want to proceed?')

    if (!confirmation) {
      exit(1)
    }
  }

  private async getUploadableInfo(): Promise<{
    size: number
    isDirectory: boolean
  }> {
    const stats = FS.lstatSync(this.path)
    const size = stats.isDirectory() ? await Utils.Collections.getFolderSize(this.path) : stats.size
    this.console.verbose('Upload size is approximately ' + (size / 1000 / 1000).toFixed(2) + ' megabytes')

    return {
      size,
      isDirectory: stats.isDirectory(),
    }
  }

  private hasUnsupportedGatewayOptions(): boolean {
    if (!isGateway(this.beeApiUrl)) {
      return false
    }

    if (this.pin) {
      this.console.error('You are trying to upload to the gateway which does not support pinning.')
      this.console.error('Please try again without the --pin option.')

      return true
    }

    if (this.sync) {
      this.console.error('You are trying to upload to the gateway which does not support syncing.')
      this.console.error('Please try again without the --sync option.')

      return true
    }

    if (this.encrypt) {
      this.console.error('You are trying to upload to the gateway which does not support encryption.')
      this.console.error('Please try again without the --encrypt option.')

      return true
    }

    return false
  }

  private async handleSyncSupport(): Promise<void | never> {
    if (this.quiet || !this.sync) {
      return
    }
    const connectedPeers = await this.getConnectedPeers()

    if (connectedPeers === null) {
      this.console.log(warningSymbol())
      this.console.log(warningText('Could not fetch connected peers info.'))
      this.console.log(warningText('Either the debug API is not enabled, or you are uploading to a gateway node.'))
      this.console.log(warningText('Synchronization may time out.'))
    } else if (connectedPeers === 0) {
      this.console.log(warningSymbol())
      this.console.log(warningText('Your Bee node has no connected peers.'))
      this.console.log(warningText('Synchronization may time out.'))
    }
  }

  private async getConnectedPeers(): Promise<number | null> {
    try {
      const { connected } = await this.beeDebug.getTopology()

      return connected
    } catch {
      return null
    }
  }
}
