import { Argument, LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { ChequeCommand } from './cheque-command'

export class Deposit extends ChequeCommand implements LeafCommand {
  public readonly name = 'deposit'

  public readonly alias = 'dep'

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
    await super.init()

    const response = await this.beeDebug.depositTokens(this.amount.toString())
    this.console.log(createKeyValue('Tx', response))
    this.console.quiet(response)
  }
}
