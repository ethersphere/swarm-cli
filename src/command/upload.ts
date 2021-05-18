import { Tag } from '@ethersphere/bee-js'
import { Presets, SingleBar } from 'cli-progress'
import * as FS from 'fs'
import { readFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { bold, green } from 'kleur'
import ora from 'ora'
import { basename, join } from 'path'
import { exit } from 'process'
import { fileExists, isGateway, sleep } from '../utils'
import { RootCommand } from './root-command'
import { VerbosityLevel } from './root-command/command-log'

export class Upload extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'upload'

  public readonly aliases = ['up']

  public readonly description = 'Upload file to Swarm'

  @Argument({ key: 'path', description: 'Path to the file or folder', required: true })
  public path!: string

  @Option({
    key: 'stamp',
    description: 'Postage stamp to use for the upload',
    required: true,
  })
  public stamp!: string

  @Option({ key: 'pin', type: 'boolean', description: 'Persist the uploaded data on the node' })
  public pin!: boolean

  @Option({
    key: 'skip-sync',
    type: 'boolean',
    description: 'Skip waiting for synchronization over the network',
    default: false,
  })
  public skipSync!: boolean

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

  public usedFromOtherCommand = false

  public async run(): Promise<void> {
    this.initCommand()
    let url: string
    let tag: Tag | undefined

    if (isGateway(this.beeApiUrl) && this.pin) {
      this.console.error('You are trying to upload to the gateway which does not support pinning.')
      this.console.error('Please try again without the --pin option.')

      return
    }

    if (isGateway(this.beeApiUrl) && !this.skipSync) {
      this.console.error('You are trying to upload to the gateway which does not support syncing.')
      this.console.error('Please try again with the --skip-sync option.')

      return
    }

    if (!this.skipSync) {
      tag = await this.bee.createTag()
    }

    if (!FS.existsSync(this.path)) {
      this.console.error(`Given filepath '${this.path}' doesn't exist`)

      exit(1)
    }

    const spinner: ora.Ora = ora('Uploading files...')

    if (this.verbosity !== VerbosityLevel.Quiet) {
      spinner.start()
    }

    if (FS.lstatSync(this.path).isDirectory()) {
      url = await this.uploadFolder(this.stamp, tag)
    } else {
      url = await this.uploadSingleFileAsFileList(this.stamp, tag)
    }

    if (spinner.isSpinning) {
      spinner.stop()
    }

    this.console.dim('Data have been sent to the Bee node successfully!')
    this.console.log(bold(`Swarm root hash -> ${green(this.hash)}`))

    this.console.dim('Waiting for file chunks to be synced on Swarm network...')
    //refresh tag before populate tracking

    if (this.skipSync) {
      this.console.info('Skipping synchronization')
    } else if (tag) {
      tag = await this.bee.retrieveTag(tag.uid)
      const synced = await this.waitForFileSynced(tag)

      if (!synced) return //error message printed before
    }

    this.console.dim('Uploading was successful!')
    this.console.log(bold(`URL -> ${green(url)}`))

    if (!this.usedFromOtherCommand) {
      this.console.quiet(this.hash)
    }
  }

  /** Init additional properties of class, that are not handled by the CLI framework */
  private initCommand(): void {
    super.init()
  }

  private async uploadFolder(postageBatchId: string, tag?: Tag): Promise<string> {
    if (!this.indexDocument && fileExists(join(this.path, 'index.html'))) {
      this.console.info('Setting --index-document to index.html')
      this.indexDocument = 'index.html'
    }

    this.hash = await this.bee.uploadFilesFromDirectory(postageBatchId, this.path, {
      indexDocument: this.indexDocument,
      errorDocument: this.errorDocument,
      tag: tag && tag.uid,
      pin: this.pin,
    })

    return `${this.beeApiUrl}/bzz/${this.hash}/`
  }

  private async uploadSingleFileAsFileList(postageBatchId: string, tag?: Tag): Promise<string> {
    const buffer = readFileSync(this.path)
    // eslint-disable-next-line
    // @ts-ignore
    const fakeFile: File = {
      name: basename(this.path),
      arrayBuffer: () => new Promise(resolve => resolve(new Uint8Array(buffer).buffer)),
    }
    this.hash = await this.bee.uploadFiles(postageBatchId, [fakeFile], {
      tag: tag && tag.uid,
      pin: this.pin,
      indexDocument: basename(this.path),
    })

    return `${this.beeApiUrl}/bzz/${this.hash}`
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
    const progressBar = new SingleBar({}, Presets.rect)

    if (this.verbosity !== VerbosityLevel.Quiet) {
      progressBar.start(tag.total, 0)
    }
    for (let i = 0; i < pollingTrials; i++) {
      tag = await this.bee.retrieveTag(tagUid)

      if (syncStatus !== tag.processed) {
        i = 0
        syncStatus = tag.processed
      }
      progressBar.update(syncStatus)

      if (syncStatus >= tag.total) {
        synced = true
        break
      }
      await sleep(pollingTime)
    }
    progressBar.stop()

    if (!synced) {
      this.console.error('Data syncing timeout.')

      return false
    } else {
      this.console.dim('Data has been synced on Swarm network')

      return true
    }
  }
}
