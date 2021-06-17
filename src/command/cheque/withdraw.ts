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
    type: 'bigint',
    description: 'Amount of tokens to withdraw in PLUR',
    required: true,
    minimum: BigInt(1),
  })
  public amount!: bigint

  public async run(): Promise<void> {
    super.init()

    if (!(await this.checkDebugApiHealth())) {
      return
    }

    const response = await this.beeDebug.withdrawTokens(this.amount.toString())
    this.console.log(green(bold('Tx: ')) + response)
    this.console.quiet(response)
  }
}
