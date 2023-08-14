import { Argument, LeafCommand } from 'furious-commander'
import { createWallet } from '.'
import { RootCommand } from '../root-command'

export class Unlock extends RootCommand implements LeafCommand {
  public readonly name = 'unlock'

  public readonly description = 'Unlocks a V3 wallet with a password and prints the private key string'

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

    if (!this.yes) {
      await this.console.confirm(
        'The private key will be printed to the console. Make sure no one is looking at your screen. Continue?',
      )
    }
    this.console.all(wallet.getPrivateKeyString())
  }
}
