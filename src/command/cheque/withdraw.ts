import { Argument, LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { ChequeCommand } from './cheque-command'

export class Withdraw extends ChequeCommand implements LeafCommand {
  public readonly name = 'withdraw'

  public readonly alias = 'wd'

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
    await super.init()

    const response = await this.beeDebug.withdrawTokens(this.amount.toString())
    this.console.log(createKeyValue('Tx', response))
    this.console.quiet(response)
  }
}
