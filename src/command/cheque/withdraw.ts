import { Argument, LeafCommand } from 'furious-commander'
import { bold, green } from 'kleur'
import { ChequeCommand } from './cheque-command'

export class Withdraw extends ChequeCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'withdraw'

  public readonly aliases = ['wd']

  public readonly description = 'Withdraw tokens from the chequebook to the overlay address'

  @Argument({
    key: 'amount',
    type: 'string',
    describe: 'Amount of tokens to withdraw (must be positive integer)',
    required: true,
  })
  public amount!: string

  public async run(): Promise<void> {
    super.init()

    if (!(await this.checkDebugApiHealth())) {
      return
    }

    const amount = this.parsePositiveBigInt(this.amount)

    if (!amount) {
      this.console.error('Could not parse amount. Is it a positive number?')

      return
    }

    const response = await this.beeDebug.withdrawTokens(amount)
    this.console.log(green(bold('Tx: ')) + response.transactionHash)
    this.console.quiet(response.transactionHash)
  }
}
