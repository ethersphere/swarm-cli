import { Argument, LeafCommand, Option } from 'furious-commander'
import { BZZ } from '@ethersphere/bee-js'
import { createKeyValue } from '../../utils/text'
import { ChequeCommand } from './cheque-command'
import { validateTokenAmount } from '../../utils/validate'

export class Deposit extends ChequeCommand implements LeafCommand {
  public readonly name = 'deposit'

  public readonly alias = 'dep'

  public readonly description = 'Deposit tokens from overlay address into chequebook'

  @Argument({
    key: 'amount',
    description: 'Amount of tokens to deposit',
    type: 'decimal-string',
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

    const response = await this.bee.depositBZZToChequebook(amountBzz)
    this.console.log(createKeyValue('Tx', response.toHex()))
    this.console.quiet(response.toHex())
  }
}
