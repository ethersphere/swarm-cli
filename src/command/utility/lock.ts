import { Argument, LeafCommand } from 'furious-commander'
import { createWallet } from '.'
import { RootCommand } from '../root-command'

export class Lock extends RootCommand implements LeafCommand {
  public readonly name = 'lock'

  public readonly description = 'Takes a wallet and locks it with a password'

  @Argument({
    key: 'wallet-source',
    description: 'Wallet source (path or private key string)',
    required: true,
    autocompletePath: true,
    conflicts: 'stdin',
  })
  public walletSource!: string

  public async run(): Promise<void> {
    await super.init()
    const wallet = await createWallet(this.walletSource, this.console)
    const password = await this.console.askForPasswordWithConfirmation(
      'Enter a new password to encrypt key file',
      'Confirm password',
    )
    this.console.all(await wallet.toV3String(password))
  }
}
