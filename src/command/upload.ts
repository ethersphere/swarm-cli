import { Tag } from '@ethersphere/bee-js'
import { Presets, SingleBar } from 'cli-progress'
import * as FS from 'fs'
import { readFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { bold, green } from 'kleur'
import * as Path from 'path'
import { basename } from 'path'
import { exit } from 'process'
import { sleep } from '../utils'
import { RootCommand } from './root-command'
import { VerbosityLevel } from './root-command/command-log'

export class Upload extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'upload'

  public readonly description = 'Upload file to Swarm'

  @Argument({ key: 'path', describe: 'Path of the file (even directory)', required: true })
  public path!: string

  @Option({ key: 'pin', type: 'boolean', describe: 'Persist the uploaded data on the gateway node' })
  public pin!: boolean

  @Option({ key: 'tag-polling-time', describe: 'Waiting time in ms between tag pollings', default: 500 })
  public tagPollingTime!: number

  @Option({ key: 'tag-polling-trials', describe: 'After the given trials the tag polling will stop', default: 15 })
  public tagPollingTrials!: number

  @Option({
    key: 'index-document',
    describe: 'Default retrieval file on bzz request without provided filepath',
    default: 'index.html',
  })
  public indexDocument!: string | undefined

  @Option({
    key: 'error-document',
    describe: 'Default error file on bzz request without with wrong filepath',
  })
  public errorDocument!: string

  // CLASS FIELDS

  public hash!: string

  public uploadAsFileList = false

  public usedFromOtherCommand = false

  public async run(): Promise<void> {
    this.initCommand()
    let tag = await this.bee.createTag()
    let url: string

    if (!FS.existsSync(this.path)) {
      this.console.error(`Given filepath '${this.path}' doesn't exist`)

      exit(1)
    }

    if (FS.lstatSync(this.path).isDirectory()) {
      url = await this.uploadDirectory(tag)
    } else if (this.uploadAsFileList) {
      url = await this.uploadSingleFileAsFileList(tag)
    } else {
      url = await this.uploadSingleFile(tag)
    }

    this.console.dim('Data have been sent to the Bee node successfully!')
    this.console.log(bold(`Swarm root hash -> ${green(this.hash)}`))

    this.console.dim('Waiting for file chunks to be synced on Swarm network...')
    //refresh tag before populate tracking
    tag = await this.bee.retrieveTag(tag.uid)
    const synced = await this.waitForFileSynced(tag)

    if (!synced) return //error message printed before

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

  private async uploadDirectory(tag: Tag): Promise<string> {
    this.console.log('Starting to upload the given folder')
    this.console.dim('Send data to the Bee node...')

    if (this.pin) this.console.dim('Pin the uploaded data')

    this.hash = await this.bee.uploadFilesFromDirectory(this.path, true, {
      indexDocument: this.indexDocument,
      errorDocument: this.errorDocument,
      tag: tag.uid,
      pin: this.pin,
    })

    return `${this.beeApiUrl}/bzz/${this.hash}/`
  }

  private async uploadSingleFile(tag: Tag): Promise<string> {
    this.console.log('Starting to upload the given file')
    this.console.dim('Send data to the Bee node...')

    this.hash = await this.bee.uploadFile(FS.createReadStream(this.path), Path.basename(this.path), {
      tag: tag.uid,
      pin: this.pin,
    })

    return `${this.beeApiUrl}/files/${this.hash}`
  }

  private async uploadSingleFileAsFileList(tag: Tag): Promise<string> {
    this.console.log('Starting to upload the given file')
    this.console.dim('Send data to the Bee node...')

    const buffer = readFileSync(this.path)
    // eslint-disable-next-line
    // @ts-ignore
    const fakeFile: File = {
      name: basename(this.path),
      arrayBuffer: () => new Promise(resolve => resolve(new Uint8Array(buffer).buffer)),
    }
    this.hash = await this.bee.uploadFiles([fakeFile], {
      tag: tag.uid,
      pin: this.pin,
      indexDocument: this.indexDocument,
    })

    return `${this.beeApiUrl}/files/${this.hash}`
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
    const pollingTime = this.tagPollingTime
    const pollingTrials = this.tagPollingTrials
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
