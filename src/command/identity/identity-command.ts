import Wallet from 'ethereumjs-wallet'
import { Identity } from '../../service/identity/types'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'

interface NamedIdentity {
  name: string
  identity: Identity
}

export class IdentityCommand extends RootCommand {
  protected throwIfNoIdentities(): void {
    if (!this.commandConfig.config.identities) {
      throw new CommandLineError(Message.noIdentity())
    }
  }

  protected async getOrPickIdentity(name?: string | null): Promise<NamedIdentity> {
    this.throwIfNoIdentities()

    if (name) {
      return { name, identity: this.getIdentityByName(name) }
    }

    const names = Object.keys(this.commandConfig.config.identities)
    const selection = await this.console.promptList(names, 'Select an identity for this action')

    return { name: selection, identity: this.getIdentityByName(selection) }
  }

  protected printWallet(wallet: Wallet): void {
    this.console.log(createKeyValue('Private key', wallet.getPrivateKeyString()))
    this.console.log(createKeyValue('Public key', wallet.getPublicKeyString()))
    this.console.log(createKeyValue('Address', wallet.getAddressString()))
  }

  protected printWalletQuietly(wallet: Wallet): void {
    this.console.quiet(wallet.getPrivateKeyString())
    this.console.quiet(wallet.getPublicKeyString())
    this.console.quiet(wallet.getAddressString())
  }

  protected getIdentityByName(name: string): Identity {
    const { identities } = this.commandConfig.config

    if (!identities || !identities[name]) {
      throw new CommandLineError(Message.noSuchIdentity(name))
    }

    return identities[name]
  }
}
