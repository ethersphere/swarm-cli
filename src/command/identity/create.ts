import { randomBytes } from 'crypto'
import Wallet from 'ethereumjs-wallet'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { bold, green } from 'kleur'
import ora from 'ora'
import { exit } from 'process'
import { IdentityType, SimpleWallet, V3Keystore } from '../../service/identity/types'
import { bytesToHex } from '../../utils/hex'
import { RootCommand } from '../root-command'
import { VerbosityLevel } from '../root-command/command-log'

export class Create extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'create'

  public readonly description = 'Create Ethereum compatible keypair to sign chunks'

  @Argument({ key: 'identity-name', default: 'main', description: 'Reference name of the generated identity' })
  public identityName!: string

  @Option({ key: 'password', alias: 'P', description: 'Password for the wallet' })
  public password!: string

  @Option({
    key: 'only-keypair',
    type: 'boolean',
    description: 'Generate only the keypair for the identity. The private key will be stored cleartext. Fast to generate',
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
        this.console.log('You have not defined password with the "--password" option.')
        this.console.info('If you want to create disposable keypair, use "only-keypair" option')
        this.password = await this.console.askForPasswordWithConfirmation()
      }
      let spinner: ora.Ora

      if (this.verbosity === VerbosityLevel.Verbose) {
        spinner = ora('Creating V3 wallet...').start()
      }
      identityWallet = await this.wallet.toV3(this.password)

      if (this.verbosity === VerbosityLevel.Verbose) {
        // spinner is surely defined
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        spinner!.stop()
      }

      identityType = IdentityType.v3
    }

    //save into config
    const successfulSave = this.commandConfig.saveIdentity(this.identityName, {
      wallet: identityWallet,
      identityType: identityType,
    })

    if (!successfulSave) {
      this.console.error(`Identity '${this.identityName}' already exist.`)

      exit(1)
    }

    //print info
    this.console.log('Keypair has been generated successfully!')
    this.console.divider()
    this.console.log(bold(`Identity name \t ${green(this.identityName)}`))
    this.console.log(`Private key \t ${green(this.wallet.getPrivateKeyString())}`)
    this.console.log(`Public key \t ${green(this.wallet.getPublicKeyString())}`)
    this.console.log(`Address \t ${green(this.wallet.getAddressString())}`)
  }

  /** Init additional properties of class, that are not handled by the CLI framework */
  private initCommand(): void {
    super.init()
  }
}
