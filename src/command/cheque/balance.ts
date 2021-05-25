import { LeafCommand } from 'furious-commander'
import { bold } from 'kleur'
import { ChequeCommand } from './cheque-command'

export class Balance extends ChequeCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'balance'

  public readonly aliases = ['bal']

  public readonly description = 'Show balance'

  public async run(): Promise<void> {
    super.init()

    if (!(await this.checkDebugApiHealth())) {
      return
    }

    this.console.info('Looking up balance...')
    const balance = await this.beeDebug.getChequebookBalance()
    this.console.log(bold('Total: ') + balance.totalBalance + ' PLUR')
    this.console.log(bold('Available: ') + balance.availableBalance + ' PLUR')
    this.console.quiet(balance.totalBalance + ' ' + balance.availableBalance)
  }
}
