import { Tag, Utils } from '@ethersphere/bee-js'
import { encodeManifestReference } from '@ethersphere/swarm-cid'
import { Presets, SingleBar } from 'cli-progress'
import * as FS from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { join, parse } from 'path'
import { exit } from 'process'
import { setCurlStore } from '../curl'
import { pickStamp, printEnrichedStamp } from '../service/stamp'
import { fileExists, isGateway, readStdin, sleep } from '../utils'
import { CommandLineError } from '../utils/error'
import { Message } from '../utils/message'
import { getMime } from '../utils/mime'
import { stampProperties } from '../utils/option'
import { createSpinner } from '../utils/spinner'
import { createKeyValue, warningSymbol, warningText } from '../utils/text'
import { RootCommand } from './root-command'
import { VerbosityLevel } from './root-command/command-log'

const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '', 10) || 100 * 1000 * 1000 // 100 megabytes

export class Upload extends RootCommand implements LeafCommand {
  public readonly name = 'upload'
  public readonly alias = 'up'
  public readonly description = 'Upload file to Swarm'

  @Argument({
    key: 'path',
    description: 'Path to the file or folder',
    required: true,
    autocompletePath: true,
    conflicts: 'stdin',
  })
  public path!: string

  @Option({ key: 'stdin', type: 'boolean', description: 'Take data from standard input', conflicts: 'path' })
  public stdin!: boolean

  @Option(stampProperties)
  public stamp!: string

  @Option({ key: 'pin', type: 'boolean', description: 'Persist the uploaded data on the node' })
  public pin!: boolean

  @Option({ key: 'encrypt', type: 'boolean', description: 'Encrypt uploaded data' })
  public encrypt!: boolean

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
    conflicts: 'name',
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

  @Option({
    key: 'name',
    description: 'Set the name of the uploaded file',
    conflicts: 'drop-name',
  })
  public fileName!: string

  @Option({
    key: 'content-type',
    description: 'Content type when uploading a single file',
  })
  public contentType!: string

  // CLASS FIELDS

  public hash!: string

  public stdinData!: Buffer

  public async run(usedFromOtherCommand = false): Promise<void> {
    await super.init()

    if (this.hasUnsupportedGatewayOptions()) {
      exit(1)
    }

    await this.maybePrintSyncWarning()

    if (!this.stdin && !FS.existsSync(this.path)) {
      throw new CommandLineError(`Given filepath '${this.path}' doesn't exist`)
    }

    if (this.stdin) {
      if (!this.stamp) {
        throw new CommandLineError('Stamp must be passed when reading data from stdin')
      }
      this.stdinData = await readStdin(this.console)
    }

    if (!this.stamp) {
      if (isGateway(this.beeApiUrl)) {
        this.stamp = '0'.repeat(64)
      } else {
        this.stamp = await pickStamp(this.beeDebug, this.console)
      }
    }

    await this.maybeRunSizeChecks()

    const tag = this.sync ? await this.bee.createTag() : undefined

    const uploadingFolder = !this.stdin && FS.statSync(this.path).isDirectory()

    if (uploadingFolder && !this.indexDocument && fileExists(join(this.path, 'index.html'))) {
      this.console.info('Setting --index-document to index.html')
      this.indexDocument = 'index.html'
    }

    const url = await this.uploadAnyWithSpinner(tag, uploadingFolder)

    this.console.dim('Data has been sent to the Bee node successfully!')
    this.console.log(createKeyValue('Swarm hash', this.hash))
    this.console.dim('Waiting for file chunks to be synced on Swarm network...')

    if (this.sync && tag) {
      await this.waitForFileSynced(tag)
    }

    this.console.dim('Uploading was successful!')
    this.console.log(createKeyValue('URL', url))

    if (url.includes('/bzz/')) {
      const swarmCid = encodeManifestReference(this.hash)
      this.console.log(createKeyValue('Bzz.link', `https://${swarmCid.toString()}.bzz.link`))
    }

    if (!usedFromOtherCommand) {
      this.console.quiet(this.hash)

      if (!isGateway(this.beeApiUrl) && !this.quiet && this.debugApiIsUsable()) {
        printEnrichedStamp(await this.beeDebug.getPostageBatch(this.stamp), this.console)
      }
    }
  }

  private async uploadAnyWithSpinner(tag: Tag | undefined, isFolder: boolean): Promise<string> {
    const spinner = createSpinner('Uploading data...')

    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      spinner.start()
    }

    try {
      const url = await this.uploadAny(tag, isFolder)

      return url
    } finally {
      if (spinner.isSpinning) {
        spinner.stop()
      }
    }
  }

  private uploadAny(tag: Tag | undefined, isFolder: boolean): Promise<string> {
    if (this.stdin) {
      return this.uploadStdin(tag)
    } else {
      if (isFolder) {
        return this.uploadFolder(tag)
      } else {
        return this.uploadSingleFile(tag)
      }
    }
  }

  private async uploadStdin(tag?: Tag): Promise<string> {
    if (this.fileName) {
      const contentType = this.contentType || getMime(this.fileName) || undefined
      const { reference } = await this.bee.uploadFile(this.stamp, this.stdinData, this.fileName, {
        tag: tag && tag.uid,
        pin: this.pin,
        encrypt: this.encrypt,
        contentType,
      })
      this.hash = reference

      return `${this.bee.url}/bzz/${this.hash}/`
    } else {
      const { reference } = await this.bee.uploadData(this.stamp, this.stdinData, { tag: tag?.uid })
      this.hash = reference

      return `${this.bee.url}/bytes/${this.hash}`
    }
  }

  private async uploadFolder(tag?: Tag): Promise<string> {
    setCurlStore({
      path: this.path,
      folder: true,
      type: 'buffer',
    })
    const { reference } = await this.bee.uploadFilesFromDirectory(this.stamp, this.path, {
      indexDocument: this.indexDocument,
      errorDocument: this.errorDocument,
      tag: tag && tag.uid,
      pin: this.pin,
      encrypt: this.encrypt,
    })
    this.hash = reference

    return `${this.bee.url}/bzz/${this.hash}/`
  }

  private async uploadSingleFile(tag?: Tag): Promise<string> {
    const contentType = this.contentType || getMime(this.path) || undefined
    setCurlStore({
      path: this.path,
      folder: false,
      type: 'stream',
    })
    const buffer = FS.readFileSync(this.path)
    const parsedPath = parse(this.path)
    const { reference } = await this.bee.uploadFile(this.stamp, buffer, this.determineFileName(parsedPath.base), {
      tag: tag && tag.uid,
      pin: this.pin,
      encrypt: this.encrypt,
      contentType,
    })
    this.hash = reference

    return `${this.bee.url}/bzz/${this.hash}/`
  }

  /**
   * Waits until the data syncing is successful on Swarm network
   *
   * @param tag had to be attached to the uploaded file
   *
   * @returns whether the file sync was successful or not.
   */
  private async waitForFileSynced(tag: Tag): Promise<void | never> {
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
    } else {
      this.console.error('Data syncing timeout.')
      exit(1)
    }
  }

  private async maybeRunSizeChecks(): Promise<void> {
    if (this.yes) {
      return
    }
    const { size } = await this.getUploadableInfo()

    if (size < MAX_UPLOAD_SIZE) {
      return
    }

    const message = `Size is larger than the recommended maximum value of ${(MAX_UPLOAD_SIZE / 1e6).toFixed(
      2,
    )} megabytes`

    if (this.quiet) {
      throw new CommandLineError(Message.requireOptionConfirmation('yes', message))
    }

    const confirmation = await this.console.confirm(message + ' Do you want to proceed?')

    if (!confirmation) {
      exit(1)
    }
  }

  private async getUploadableInfo(): Promise<{
    size: number
  }> {
    let size = -1

    if (this.stdin) {
      size = this.stdinData.length
    } else {
      const stats = FS.lstatSync(this.path)
      size = stats.isDirectory() ? await Utils.getFolderSize(this.path) : stats.size
    }
    this.console.verbose('Upload size is approximately ' + (size / 1000 / 1000).toFixed(2) + ' megabytes')

    return {
      size,
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

  private async maybePrintSyncWarning(): Promise<void> {
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
      const { connected } = await this._beeDebug.getTopology()

      return connected
    } catch {
      return null
    }
  }

  private determineFileName(defaultName: string): string | undefined {
    if (this.dropName) {
      return undefined
    }

    if (this.fileName) {
      return this.fileName
    }

    return defaultName
  }
}
