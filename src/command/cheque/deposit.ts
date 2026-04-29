import { Argument, LeafCommand, Option } from 'furious-commander'
import { BZZ } from '@ethersphere/bee-js'
import { Context } from 'madlad'
import { createKeyValue } from '../../utils/text'
import { ChequeCommand } from './cheque-command'

export class Deposit extends ChequeCommand implements LeafCommand {
  public readonly name = 'deposit'

  public readonly alias = 'dep'

  public readonly description = 'Deposit tokens from overlay address into chequebook'

  @Argument({
    key: 'amount',
    description: 'Amount of tokens to deposit',
    type: 'decimal-string',
    required: true,
    validate: (value: unknown, context: Context): string[] => {
      if (context.options.unit === 'bzz') {
        const amount = parseFloat(value as string)

        if (isNaN(amount) || amount <= 0) {
          return [`Invalid amount '${value}'. Amount must be a positive number.`]
        }
      } else {
        try {
          const amount = BigInt(value as string)

          if (amount <= BigInt(0)) {
            return [`Invalid amount '${value}'. Amount must be a positive integer.`]
          }
        } catch (e) {
          return [`Invalid amount '${value}'. Amount must be a positive integer.`]
        }
      }

      return []
    },
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
