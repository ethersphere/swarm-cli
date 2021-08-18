import { randomBytes } from 'crypto'
import Wallet from 'ethereumjs-wallet'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { IdentityType, SimpleWallet, V3Keystore } from '../../service/identity/types'
import { bytesToHex } from '../../utils/hex'
import { createSpinner } from '../../utils/spinner'
import { createKeyValue } from '../../utils/text'
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
    description:
      'Generate only the keypair for the identity. The private key will be stored cleartext. Fast to generate',
  })
  public onlyKeypair!: boolean

  // CLASS FIELDS
  public wallet!: Wallet

  public async run(): Promise<void> {
    super.init()

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
      const spinner = createSpinner('Creating V3 wallet...')

      if (this.verbosity === VerbosityLevel.Verbose) {
        spinner.start()
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
    this.console.log(createKeyValue('Identity name', this.identityName))
    this.console.log(createKeyValue('Private key', this.wallet.getPrivateKeyString()))
    this.console.log(createKeyValue('Public key', this.wallet.getPublicKeyString()))
    this.console.log(createKeyValue('Address', this.wallet.getAddressString()))
  }
}
