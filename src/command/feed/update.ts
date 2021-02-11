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

export class Update extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'update'

  public readonly description = 'Update feed'

  @Option({ key: 'identity', describe: 'Name of the identity', required: true })
  public identity!: string

  @Option({ key: 'topic', describe: 'Feed topic', required: true })
  public topic!: string

  @Option({ key: 'password', describe: 'Password for the wallet' })
  public password!: string

  @Option({ key: 'reference', describe: 'The new reference' })
  public reference!: string

  // CLASS FIELDS

  public async run(): Promise<void> {
    this.initCommand()

    const identity = this.commandConfig.config.identities[this.identity]
    if (!identity) {
      console.warn(red(`Invalid identity name: '${this.identity}'`))

      exit(1)
    }
    try {
      const wallet = await getWalletFromIdentity(identity, this.password)
      const signer = wallet.getPrivateKey()
      const feed = this.bee.makeFeedWriter(signer, this.topic)
      const updateReference = await feed.upload(this.reference)

      const manifestResponse = await feed.createManifest()

      const url = `${this.beeApiUrl}/bzz/${manifestResponse.reference}`
      console.log(dim('Uploading was successful!'))
      console.log(bold(`URL -> ${green(url)}`))
    } catch (e) {
      console.warn(red(e.message))

      exit(1)
    }
  }

  /** Init additional properties of class, that are not handled by the CLI framework */
  private initCommand(): void {
    super.init()
  }
}
