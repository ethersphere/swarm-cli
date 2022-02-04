import Wallet from 'ethereumjs-wallet'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { isSimpleWallet, isV3Wallet } from '../../service/identity'
import { normalizePrivateKey } from '../../utils'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { IdentityCommand } from './identity-command'

export class Show extends IdentityCommand implements LeafCommand {
  public readonly name = 'show'

  public readonly description = 'Print private key, public key and address of an identity'

  @Argument({ key: 'name', description: 'Name of the identity to show' })
  public identityName!: string

  @Option({ key: 'password', alias: 'P', description: 'Password of the wallet' })
  public password!: string

  public async run(): Promise<void> {
    await super.init()
    const { identity } = await this.getOrPickIdentity(this.identityName)

    await this.maybePromptForSensitive()

    if (isV3Wallet(identity.wallet, identity.identityType)) {
      if (!this.password) {
        this.password = await this.console.askForPassword(Message.existingV3Password())
      }
      const wallet = await Wallet.fromV3(identity.wallet, this.password)
      this.printWallet(wallet)
      this.printWalletQuietly(wallet)
    } else if (isSimpleWallet(identity.wallet, identity.identityType)) {
      const wallet = Wallet.fromPrivateKey(Buffer.from(normalizePrivateKey(identity.wallet.privateKey), 'hex'))
      this.printWallet(wallet)
      this.printWalletQuietly(wallet)
    } else {
      throw new CommandLineError('Unsupported identity type')
    }
  }

  private async maybePromptForSensitive(): Promise<void | never> {
    if (this.yes) {
      return
    }

    if (this.quiet && !this.yes) {
      throw new CommandLineError(
        Message.requireOptionConfirmation('yes', 'This will print sensitive information to the console'),
      )
    }

    if (!(await this.console.confirmAndDelete('This will print sensitive information to the console. Continue?'))) {
      exit(0)
    }
  }
}
