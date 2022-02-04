import { randomBytes } from 'crypto'
import Wallet from 'ethereumjs-wallet'
import { Argument, LeafCommand, Option, Utils } from 'furious-commander'
import { getPrintableIdentityType } from '../../service/identity'
import { Identity, IdentityType } from '../../service/identity/types'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { createAndRunSpinner } from '../../utils/spinner'
import { createKeyValue } from '../../utils/text'
import { IdentityCommand } from './identity-command'

export class Create extends IdentityCommand implements LeafCommand {
  public readonly name = 'create'

  public readonly description = 'Create Ethereum compatible keypair to sign chunks'

  @Argument({ key: 'name', default: 'main', description: 'Reference name of the generated identity' })
  public identityName!: string

  @Option({ key: 'password', alias: 'P', description: 'Password for the wallet' })
  public password!: string

  @Option({
    key: 'only-keypair',
    alias: 'k',
    type: 'boolean',
    description:
      'Generate only the keypair for the identity. The private key will be stored cleartext. Fast to generate',
  })
  public onlyKeypair!: boolean

  public async run(): Promise<void> {
    await super.init()

    if (Utils.getSourcemap().name === 'default') {
      this.console.info(`No identity name specified, defaulting to '${this.identityName}'`)
    }

    if (this.commandConfig.config.identities[this.identityName]) {
      throw new CommandLineError(Message.identityNameConflictArgument(this.identityName))
    }

    const wallet = this.generateWallet()
    const identity = this.onlyKeypair ? this.createPrivateKeyIdentity(wallet) : await this.createV3Identity(wallet)

    const saved = this.commandConfig.saveIdentity(this.identityName, identity)

    if (!saved) {
      throw new CommandLineError(Message.identityNameConflictArgument(this.identityName))
    }

    this.console.log(createKeyValue('Name', this.identityName))
    this.console.log(createKeyValue('Type', getPrintableIdentityType(identity.identityType)))
    this.printWallet(wallet)
    this.printWalletQuietly(wallet)
  }

  private async createV3Identity(wallet: Wallet): Promise<Identity> {
    if (!this.password) {
      this.console.log(Message.optionNotDefined('password'))
      this.console.info('If you want to create passwordless keypair, use the --only-keypair option')
      this.password = await this.console.askForPasswordWithConfirmation(
        Message.newV3Password(),
        Message.newV3PasswordConfirmation(),
      )
    }
    const spinner = createAndRunSpinner('Creating V3 wallet...', this.verbosity)
    const v3 = await wallet.toV3(this.password)
    spinner.stop()

    return {
      wallet: v3,
      identityType: IdentityType.v3,
    }
  }

  private createPrivateKeyIdentity(wallet: Wallet): Identity {
    return {
      wallet: {
        privateKey: wallet.getPrivateKeyString(),
      },
      identityType: IdentityType.simple,
    }
  }

  private generateWallet(): Wallet {
    const privateKey = randomBytes(32)

    return new Wallet(privateKey)
  }
}
