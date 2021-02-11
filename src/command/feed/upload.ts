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

  @Option({ key: 'identity', describe: 'Name of the identity', required: true })
  public identity!: string

  @Option({ key: 'topic', describe: 'Feed topic', required: true })
  public topic!: string

  @Option({ key: 'password', describe: 'Password for the wallet' })
  public password!: string

  // CLASS FIELDS

  public async run(): Promise<void> {
    super.init()

    const identity = this.commandConfig.config.identities[this.identity]
    if (!identity) {
      console.warn(red(`Invalid identity name: '${this.identity}'`))

      exit(1)
    }
    try {
      await super.run()

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
}
