import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { ChequeCommand } from './cheque-command'

export class WithdrawAll extends ChequeCommand implements LeafCommand {
  public readonly name = 'withdraw-all'

  public readonly alias = 'wa'

  public readonly description = 'Withdraw all available tokens from the chequebook to the overlay address'

  public async run(): Promise<void> {
    await super.init()

    const balance = await this.bee.getChequebookBalance()
    const response = await this.bee.withdrawTokens(balance.availableBalance)
    this.console.log(createKeyValue('Tx', response))
    this.console.quiet(response)
  }
}
