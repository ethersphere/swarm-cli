import { Argument, LeafCommand, Option } from 'furious-commander'
import { BZZ } from '@ethersphere/bee-js'
import { createKeyValue } from '../../utils/text'
import { ChequeCommand } from './cheque-command'
import { validateTokenAmount } from '../../utils/validate'

export class Withdraw extends ChequeCommand implements LeafCommand {
  public readonly name = 'withdraw'

  public readonly alias = 'wd'

  public readonly description = 'Withdraw tokens from the chequebook to the overlay address'

  @Argument({
    key: 'amount',
    type: 'string',
    description: 'Amount of tokens to withdraw',
    required: true,
    validate: validateTokenAmount,
  })
  public amount!: string

  @Option({
    key: 'unit',
    type: 'enum',
    description: 'Unit of the amount',
    enum: ['bzz', 'plur'],
    default: 'bzz',
  })
  public unit!: string

  public async run(): Promise<void> {
    super.init()

    const amountBzz = this.unit === 'bzz' ? BZZ.fromDecimalString(this.amount) : BZZ.fromPLUR(this.amount)

    const response = await this.bee.withdrawBZZFromChequebook(amountBzz)
    this.console.log(createKeyValue('Tx', response.toHex()))
    this.console.quiet(response.toHex())
  }
}
