import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { ChequeCommand } from './cheque-command'

export class WithdrawAll extends ChequeCommand implements LeafCommand {
  public readonly name = 'withdraw-all'

  public readonly alias = 'wa'

  public readonly description = 'Withdraw all available tokens from the chequebook to the overlay address'

  public async run(): Promise<void> {
    super.init()

    const balance = await this.bee.getChequebookBalance()

    if (balance.availableBalance.toPLURBigInt() === BigInt(0)) {
      this.console.error('No tokens to withdraw.')

      return
    }
    this.console.log(`Withdrawing ${balance.availableBalance.toDecimalString()} xBZZ from the chequebook`)
    const response = await this.bee.withdrawTokens(balance.availableBalance.toPLURString())
    this.console.log(createKeyValue('Tx', response.toHex()))
    this.console.quiet(response.toHex())
  }
}
