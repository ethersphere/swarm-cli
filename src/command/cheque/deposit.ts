import { Argument, LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { ChequeCommand } from './cheque-command'

export class Deposit extends ChequeCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'deposit'

  public readonly aliases = ['dep']

  public readonly description = 'Deposit tokens from overlay address into chequebook'

  @Argument({
    key: 'amount',
    type: 'bigint',
    description: 'Amount of tokens to deposit in PLUR',
    required: true,
    minimum: BigInt(1),
  })
  public amount!: bigint

  public async run(): Promise<void> {
    super.init()

    if (!(await this.checkDebugApiHealth())) {
      return
    }

    const response = await this.beeDebug.depositTokens(this.amount.toString())
    this.console.log(createKeyValue('Tx', response))
    this.console.quiet(response)
  }
}
