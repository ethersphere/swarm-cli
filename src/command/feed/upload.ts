import { LeafCommand, Argument, Option } from 'furious-commander'
import { RootCommand } from '../root-command'
import Wallet from 'ethereumjs-wallet'
import { randomBytes } from 'crypto'
import { bold, dim, green, italic, red } from 'kleur'
import { divider } from '../../utils/console-log'
import { IdentityType, SimpleWallet, V3Keystore } from '../../service/identity/types'
import { bytesToHex } from '../../utils/hex'
import { exit } from 'process'
import { askForPassword } from '../../utils/prompt'
import ora from 'ora'
import { getWalletFromIdentity } from '../../service/identity'
import { Upload as UploadBase } from '../upload'
import * as FS from 'fs'
import * as Path from 'path'
import { Tag } from '@ethersphere/bee-js'
import { Presets, SingleBar } from 'cli-progress'
import { sleep } from '../../utils'

export class Upload extends UploadBase {
  // CLI FIELDS

  public readonly name = 'upload'

  @Argument({ key: 'path', describe: 'Path of the file (even directory)', required: true })
  public path!: string

  @Option({ key: 'identity', describe: 'Name of the identity', required: true })
  public identity!: string

  @Option({ key: 'topic', describe: 'Feed topic', required: true })
  public topic!: string

  @Option({ key: 'password', describe: 'Password for the wallet' })
  public password!: string

  @Option({ key: 'pin', type: 'boolean', describe: 'Persist the uploaded data on the gateway node' })
  public pin!: boolean

  @Option({ key: 'recursive', alias: 'r', describe: 'Upload directory', default: true })
  public recursive!: boolean

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

  public async run(): Promise<void> {
    super.init()

    const identity = this.commandConfig.config.identities[this.identity]
    if (!identity) {
      console.warn(red(`Invalid identity name: '${this.identity}'`))

      exit(1)
    }
    try {
      await this.upload()

      const wallet = await getWalletFromIdentity(identity, this.password)
      const signer = wallet.getPrivateKey()
      const feed = this.bee.makeFeedWriter(signer, this.topic)
      const updateReference = await feed.upload(this.hash)

      const manifestResponse = await feed.createManifest()

      const url = `${this.beeApiUrl}/bzz/${manifestResponse.reference}`
      console.log(dim('Uploading was successful!'))
      console.log(bold(`Manifest -> ${green(url)}`))
    } catch (e) {
      console.warn(red(e.message))

      exit(1)
    }
  }

  public async upload(): Promise<void> {
    let tag = await this.bee.createTag()
    let url: string

    if (!FS.existsSync(this.path)) {
      console.warn(bold().red(`Given filepath '${this.path}' doesn't exist`))

      exit(1)
    }

    if (FS.lstatSync(this.path).isDirectory()) {
      console.log('Starting to upload the given folder')
      console.log(dim('Send data to the Bee node...'))

      if (this.pin) console.log(dim('Pin the uploaded data'))

      this.hash = await this.bee.uploadFilesFromDirectory(this.path, this.recursive, {
        indexDocument: this.indexDocument,
        errorDocument: this.errorDocument,
        tag: tag.uid,
        pin: this.pin,
      })
      url = `${this.beeApiUrl}/bzz/${this.hash}`
    } else {
      console.log('Starting to upload the given file')
      console.log(dim('Send data to the Bee node...'))

      this.hash = await this.bee.uploadFile(FS.createReadStream(this.path), Path.basename(this.path), {
        tag: tag.uid,
        pin: this.pin,
      })
      url = `${this.beeApiUrl}/files/${this.hash}`
    }
    console.log(dim('Data have been sent to the Bee node successfully!'))
    console.log(bold(`Swarm root hash -> ${green(this.hash)}`))

    console.log(dim('Waiting for file chunks to be synced on Swarm network...'))
    //refresh tag before populate tracking
    tag = await this.bee.retrieveTag(tag.uid)
    const synced = await this.waitForFileSynced(tag)

    if (!synced) return //error message printed before

    console.log(dim('Uploading was successful!'))
    console.log(bold(`URL -> ${green(url)}`))
  }

  private async waitForFileSynced(tag: Tag): Promise<boolean> {
    const tagUid = tag.uid
    const pollingTime = this.tagPollingTime
    const pollingTrials = this.tagPollingTrials
    let synced = false
    const syncedBar = new SingleBar({}, Presets.rect)
    console.log('tag', tag) //TODO remove after bug has been presented
    syncedBar.start(tag.total, 0)
    for (let i = 0; i < pollingTrials; i++) {
      tag = await this.bee.retrieveTag(tagUid)
      const updateState = tag.synced

      syncedBar.update(updateState)

      if (tag.total === updateState) {
        synced = true
        break
      }
      await sleep(pollingTime)
    }
    syncedBar.stop()

    if (!synced) {
      console.warn(red('Data syncing timeout.'))

      return false
    } else {
      console.log(dim('Data has been synced on Swarm network'))

      return true
    }
  }

}
