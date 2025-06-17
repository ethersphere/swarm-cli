import { RedundancyLevel, Reference, Tag, Utils } from '@ethersphere/bee-js'
import { Numbers, Optional, System } from 'cafe-utility'
import { Presets, SingleBar } from 'cli-progress'
import * as FS from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { join, parse } from 'path'
import { exit } from 'process'
import { setCurlStore } from '../curl'
import { pickStamp, printStamp } from '../service/stamp'
import { fileExists, isGateway, readStdin } from '../utils'
import { CommandLineError } from '../utils/error'
import { getMime } from '../utils/mime'
import { stampProperties } from '../utils/option'
import { createSpinner } from '../utils/spinner'
import { createKeyValue, warningSymbol, warningText } from '../utils/text'
import { RootCommand } from './root-command'
import { VerbosityLevel } from './root-command/command-log'

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

  @Option({ key: 'deferred', type: 'boolean', description: 'Do not wait for network sync', default: true })
  public deferred!: boolean

  @Option({
    key: 'act',
    type: 'boolean',
    description: 'Upload with ACT',
    default: false,
    required: { when: 'act-history-address' },
  })
  public act!: boolean

  @Option({ key: 'act-history-address', type: 'string', description: 'ACT history address' })
  public optHistoryAddress!: string

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

  @Option({
    key: 'redundancy',
    description: 'Redundancy of the upload (MEDIUM, STRONG, INSANE, PARANOID)',
  })
  public redundancy!: string

  public stdinData!: Buffer

  public historyAddress: Optional<Reference> = Optional.empty()

  // eslint-disable-next-line complexity
  public async run(usedFromOtherCommand = false): Promise<void> {
    super.init()

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
        this.stamp = await pickStamp(this.bee, this.console)
      }
    }

    await this.maybePrintRedundancyStats()

    const tag = this.sync ? await this.bee.createTag() : undefined

    const uploadingFolder = !this.stdin && FS.statSync(this.path).isDirectory()

    if (uploadingFolder && !this.indexDocument && fileExists(join(this.path, 'index.html'))) {
      this.console.info('Setting --index-document to index.html')
      this.indexDocument = 'index.html'
    }

    const url = await this.uploadAnyWithSpinner(tag, uploadingFolder)

    this.console.dim('Data has been sent to the Bee node successfully!')
    this.console.log(createKeyValue('Swarm hash', this.result.getOrThrow().toHex()))

    if (this.act) {
      this.console.log(createKeyValue('Swarm history address', this.historyAddress.getOrThrow().toHex()))
    }
    this.console.dim('Waiting for file chunks to be synced on Swarm network...')

    if (this.sync && tag) {
      await this.waitForFileSynced(tag)
    }

    this.console.dim('Uploading was successful!')
    this.console.log(createKeyValue('URL', url))

    if (!usedFromOtherCommand) {
      this.console.quiet(this.result.getOrThrow().toHex())

      if (!isGateway(this.beeApiUrl) && !this.quiet) {
        printStamp(await this.bee.getPostageBatch(this.stamp), this.console, { shortenBatchId: true })
      }
    }
  }

  private async uploadAnyWithSpinner(tag: Tag | undefined, isFolder: boolean): Promise<string> {
    const spinner = createSpinner(this.path ? `Uploading ${this.path}...` : 'Uploading data from stdin...')

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
      const { reference, historyAddress } = await this.bee.uploadFile(this.stamp, this.stdinData, this.fileName, {
        tag: tag && tag.uid,
        pin: this.pin,
        encrypt: this.encrypt,
        contentType,
        deferred: this.deferred,
        redundancyLevel: this.determineRedundancyLevel(),
        act: this.act,
        actHistoryAddress: this.optHistoryAddress,
      })
      this.result = Optional.of(reference)

      if (this.act) {
        this.historyAddress = historyAddress
      }

      return `${this.bee.url}/bzz/${reference.toHex()}/`
    } else {
      const { reference, historyAddress } = await this.bee.uploadData(this.stamp, this.stdinData, {
        tag: tag?.uid,
        deferred: this.deferred,
        encrypt: this.encrypt,
        redundancyLevel: this.determineRedundancyLevel(),
        act: this.act,
        actHistoryAddress: this.optHistoryAddress,
      })
      this.result = Optional.of(reference)

      if (this.act) {
        this.historyAddress = historyAddress
      }

      return `${this.bee.url}/bytes/${reference.toHex()}`
    }
  }

  private async uploadFolder(tag?: Tag): Promise<string> {
    setCurlStore({
      path: this.path,
      folder: true,
      type: 'buffer',
    })
    const { reference, historyAddress } = await this.bee.uploadFilesFromDirectory(this.stamp, this.path, {
      indexDocument: this.indexDocument,
      errorDocument: this.errorDocument,
      tag: tag && tag.uid,
      pin: this.pin,
      encrypt: this.encrypt,
      deferred: this.deferred,
      redundancyLevel: this.determineRedundancyLevel(),
      act: this.act,
      actHistoryAddress: this.optHistoryAddress,
    })
    this.result = Optional.of(reference)

    if (this.act) {
      this.historyAddress = historyAddress
    }

    return `${this.bee.url}/bzz/${reference.toHex()}/`
  }

  private async uploadSingleFile(tag?: Tag): Promise<string> {
    const contentType = this.contentType || getMime(this.path) || undefined
    setCurlStore({
      path: this.path,
      folder: false,
      type: 'stream',
    })
    const readable = FS.createReadStream(this.path)
    const parsedPath = parse(this.path)
    const { reference, historyAddress } = await this.bee.uploadFile(
      this.stamp,
      readable,
      this.determineFileName(parsedPath.base),
      {
        tag: tag && tag.uid,
        pin: this.pin,
        encrypt: this.encrypt,
        contentType,
        deferred: this.deferred,
        redundancyLevel: this.determineRedundancyLevel(),
        act: this.act,
        actHistoryAddress: this.optHistoryAddress,
      },
    )
    this.result = Optional.of(reference)

    if (this.act) {
      this.historyAddress = historyAddress
    }

    return `${this.bee.url}/bzz/${reference.toHex()}/`
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
    let syncProgress = 0
    const progressBar = new SingleBar({ clearOnComplete: true }, Presets.rect)

    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      progressBar.start(tag.split, 0)
    }
    for (let i = 0; i < pollingTrials; i++) {
      tag = await this.bee.retrieveTag(tagUid)
      const newSyncProgress = tag.seen + tag.synced

      if (newSyncProgress > syncProgress) {
        i = 0
      }

      syncProgress = newSyncProgress

      if (syncProgress >= tag.split) {
        synced = true
        break
      }

      if (this.curl) {
        this.console.log(`${syncProgress} / ${tag.split}`)
      } else {
        progressBar.setTotal(tag.split)
        progressBar.update(syncProgress)
      }
      await System.sleepMillis(pollingTime)
    }
    progressBar.stop()

    if (synced) {
      this.console.dim('Data has been synced on Swarm network')
    } else {
      this.console.error(this.path ? `'Data syncing timeout for ${this.path}'` : 'Data syncing timeout')
      exit(1)
    }
  }

  private async maybePrintRedundancyStats(): Promise<void> {
    if (!this.redundancy || this.quiet) {
      return
    }

    const currentSetting = Utils.getRedundancyStat(this.redundancy)
    const originalSize = await this.getUploadSize()
    const originalChunks = Math.ceil(originalSize / 4e3)
    const sizeMultiplier = Utils.approximateOverheadForRedundancyLevel(
      originalChunks,
      currentSetting.value,
      this.encrypt,
    )
    const newSize = originalChunks * 4e3 * (1 + sizeMultiplier)
    const extraSize = newSize - originalSize

    this.console.log(createKeyValue('Redundancy setting', currentSetting.label))
    this.console.log(`This setting will provide ${Math.round(currentSetting.errorTolerance * 100)}% error tolerance.`)
    this.console.log(`An additional ${Numbers.convertBytes(extraSize)} of data will be uploaded approximately.`)
    this.console.log(
      `${Numbers.convertBytes(originalSize)} → ${Numbers.convertBytes(newSize)} (+${Numbers.convertBytes(extraSize)})`,
    )

    if (!this.yes && !this.quiet) {
      const confirmation = await this.console.confirm('Do you want to proceed?')

      if (!confirmation) {
        exit(0)
      }
    }
  }

  private async getUploadSize(): Promise<number> {
    let size = -1

    if (this.stdin) {
      size = this.stdinData.length
    } else {
      const stats = FS.lstatSync(this.path)
      size = stats.isDirectory() ? await Utils.getFolderSize(this.path) : stats.size
    }

    this.console.verbose(`Upload size is approximately ${Numbers.convertBytes(size)}`)

    return size
  }

  private hasUnsupportedGatewayOptions(): boolean {
    if (!isGateway(this.beeApiUrl)) {
      return false
    }

    if (this.act) {
      this.console.error('You are trying to upload to the gateway which does not support ACT.')
      this.console.error('Please try again without the --act option.')

      return true
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
      this.console.log(warningText('Are you uploading to a gateway node?'))
      this.console.log(warningText('Synchronization may time out.'))
    } else if (connectedPeers === 0) {
      this.console.log(warningSymbol())
      this.console.log(warningText('Your Bee node has no connected peers.'))
      this.console.log(warningText('Synchronization may time out.'))
    }
  }

  private async getConnectedPeers(): Promise<number | null> {
    try {
      const { connected } = await this.bee.getTopology()

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

  private determineRedundancyLevel(): RedundancyLevel | undefined {
    if (!this.redundancy) {
      return undefined
    }
    switch (this.redundancy.toUpperCase()) {
      case 'MEDIUM':
        return RedundancyLevel.MEDIUM
      case 'STRONG':
        return RedundancyLevel.STRONG
      case 'INSANE':
        return RedundancyLevel.INSANE
      case 'PARANOID':
        return RedundancyLevel.PARANOID
      default:
        throw new CommandLineError(`Invalid redundancy level: ${this.redundancy}`)
    }
  }
}
