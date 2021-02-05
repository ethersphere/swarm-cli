import { LeafCommand, Argument, Option } from 'furious-commander'
import { RootCommand } from '../root-command'
import Wallet from 'ethereumjs-wallet'
import { randomBytes } from 'crypto'
import { bold, green, italic, red } from 'kleur'
import { divider } from '../../utils/console-log'
import { IdentityType, SimpleWallet, V3Keystore } from '../../service/identity/types'
import { bytesToHex } from '../../utils/hex'
import { exit } from 'process'
import { askForPassword } from '../../utils/prompt'
import ora from 'ora'

export class Create extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'create'

  public readonly description = 'Create Ethereum compatible keypair to sign chunks'

  @Argument({ key: 'identity-name', default: 'main', describe: 'Reference name of the generated identity' })
  public identityName!: string

  @Option({ key: 'password', describe: 'Password for the wallet' })
  public password!: string

  @Option({
    key: 'only-keypair',
    type: 'boolean',
    describe: 'Generate only the keypair for the identity. The private key will be stored cleartext. Fast to generate',
  })
  public onlyKeypair!: boolean

  // CLASS FIELDS
  public wallet!: Wallet

  public async run(): Promise<void> {
    this.initCommand()

    //simple wallet
    const privateKey = randomBytes(32)
    this.wallet = new Wallet(privateKey)
    let identityWallet: SimpleWallet | V3Keystore = { privateKey: bytesToHex(privateKey) }
    let identityType: IdentityType = IdentityType.simple

    //v3 wallet
    if (!this.onlyKeypair) {
      if (!this.password) {
        console.log('You have not defined password with the "--password" option.')
        console.log(italic('If you want to create disposable keypair, use "only-keypair" option'))
        this.password = await askForPassword()
      }
      const spinner = ora('Creating V3 wallet...').start()
      identityWallet = await this.wallet.toV3(this.password)
      spinner.stop()
      identityType = IdentityType.v3
    }

    //save into config
    const successfulSave = this.commandConfig.saveIdentity(this.identityName, {
      wallet: identityWallet,
      identityType: identityType,
    })

    if (!successfulSave) {
      console.warn(red(`Identity '${this.identityName}' already exist.`))

      exit(1)
    }

    //print info
    console.log('Keypair has been generated successfully!')
    divider()
    console.log(bold(`Identity name \t ${green(this.identityName)}`))
    console.log(`Private key \t ${green(this.wallet.getPrivateKeyString())}`)
    console.log(`Public key \t ${green(this.wallet.getPublicKeyString())}`)
    console.log(`Address \t ${green(this.wallet.getAddressString())}`)
  }

  /** Init additional properties of class, that are not handled by the CLI framework */
  private initCommand(): void {
    super.init()
  }
}
