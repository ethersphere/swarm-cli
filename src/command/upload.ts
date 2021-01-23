import { Option, LeafCommand, Argument } from 'furious-commander'
import { RootCommand } from './root-command'
import * as FS from 'fs'
import * as Path from 'path'
import { sleep } from '../utils'
import { Tag } from '@ethersphere/bee-js/dist/types'
import { SingleBar, Presets } from 'cli-progress'
import { bold, green, dim, red } from 'kleur'

export class Upload extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'upload'

  public readonly description = 'Upload file to Swarm'

  @Argument({ key: 'path', describe: 'Path of the file (even directory)', demandOption: true })
  public path!: string

  // @Option({ key: 'encrypt', describe: 'Encrypt the passed data with a randomly generated key' })
  // public encrypt!: boolean

  @Option({ key: 'pin', type: 'boolean', describe: 'Preserve the uploaded data on the gateway node' })
  public pin!: boolean

  @Option({ key: 'recursive', alias: 'r', describe: 'Upload directory', default: true })
  public resursive!: boolean

  @Option({ key: 'tag-polling-time', describe: 'Waiting time in ms between tag pollings', default: 500 })
  public tagPollingTime!: number

  @Option({ key: 'tag-polling-trials', describe: 'After the given trials the tag polling will stop', default: 15 })
  public tagPollingTrials!: number

  @Option({
    key: 'index-document',
    describe: 'Default retrieval file on bzz request without provided filepath',
    default: 'index.html',
  })
  public indexDocument!: string

  @Option({
    key: 'error-document',
    describe: 'Default error file on bzz request without with wrong filepath',
  })
  public errorDocument!: string

  // CLASS FIELDS

  public hash!: string

  public async run(): Promise<void> {
    this.initCommand()
    let tag = await this.bee.createTag()
    let url: string
    let directory = false

    if (!FS.existsSync(this.path)) {
      console.warn(bold().red(`Given filepath '${this.path}' doesn't exist`))

      return
    }

    if (FS.lstatSync(this.path).isDirectory()) {
      directory = true
      console.log('Starting to upload the given folder')
      console.log(dim('Send data to the gateway Bee node...'))

      this.hash = await this.bee.uploadFilesFromDirectory(this.path, this.resursive, {
        indexDocument: this.indexDocument,
        errorDocument: this.errorDocument,
        tag: tag.uid,
      })
      url = `${this.beeApiUrl}/bzz/${this.hash}`
    } else {
      console.log('Starting to upload the given file')
      console.log(dim('Send data to the gateway Bee node...'))

      this.hash = await this.bee.uploadFile(FS.createReadStream(this.path), Path.basename(this.path), {
        tag: tag.uid,
      })
      url = `${this.beeApiUrl}/files/${this.hash}`
    }
    console.log(dim('Data have been sent to the gateway node successfully!'))
    console.log(bold(`Swarm root hash -> ${green(this.hash)}`))

    console.log(dim('Waiting for file chunks populate on Swarm network...'))
    //refresh tag before populate tracking
    tag = await this.bee.retrieveTag(tag.uid)
    await this.waitForFilePopulate(tag)
    console.log(dim('Uploading was successful!'))
    console.log(bold(`URL -> ${green(url)}`))

    if (this.pin) {
      console.log('Pinning the file')

      if (directory) await this.bee.pinCollection(this.hash)
      else await this.bee.pinFile(this.hash)
      console.log('Pinning was successful!')
    }
  }

  /** Init additional properties of class, that are not handled by the CLI framework */
  private initCommand(): void {
    super.init()
  }

  private async waitForFilePopulate(tag: Tag) {
    const tagUid = tag.uid
    const pollingTime = this.tagPollingTime
    const pollingTrials = this.tagPollingTrials
    let populated = false
    const populateBar = new SingleBar({}, Presets.rect)
    populateBar.start(tag.split, 0)
    for (let i = 0; i < pollingTrials; i++) {
      tag = await this.bee.retrieveTag(tagUid)

      populateBar.update(tag.seen === 0 ? tag.synced : tag.seen)

      if (tag.synced === tag.stored || tag.seen === tag.stored) {
        populated = true
        break
      }
      await sleep(pollingTime)
    }
    populateBar.stop()

    if (!populated) {
      console.warn(red('Data population timeout.'))
    } else {
      console.log(dim('Data has been populated on Swarm network'))
    }
  }
}
