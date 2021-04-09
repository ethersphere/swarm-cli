import { LeafCommand } from 'furious-commander'
import { bold } from 'kleur'
import { ChequeCommand } from './cheque-command'

export class Balance extends ChequeCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'balance'

  public readonly aliases = ['b', 'ba', 'bal']

  public readonly description = 'Show balance'

  public async run(): Promise<void> {
    super.init()
    await this.checkDebugApiHealth()

    this.console.info('Looking up balance...')
    const balance = await this.beeDebug.getChequebookBalance()
    this.console.log(bold('Total: ') + balance.totalBalance)
    this.console.log(bold('Available: ') + balance.availableBalance)
    this.console.quiet(balance.totalBalance + ' ' + balance.availableBalance)
  }
}
