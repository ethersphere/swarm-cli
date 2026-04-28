import { Argument, LeafCommand, Option } from 'furious-commander'
import { BZZ } from '@ethersphere/bee-js'
import { Context } from 'madlad'
import { createKeyValue } from '../../utils/text'
import { ChequeCommand } from './cheque-command'

export class Withdraw extends ChequeCommand implements LeafCommand {
  public readonly name = 'withdraw'

  public readonly alias = 'wd'

  public readonly description = 'Withdraw tokens from the chequebook to the overlay address'

  @Argument({
    key: 'amount',
    type: 'string',
    description: 'Amount of tokens to withdraw',
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

    const amountBZZ = this.unit === 'bzz' ? BZZ.fromDecimalString(this.amount) : BZZ.fromPLUR(this.amount)

    const response = await this.bee.withdrawBZZFromChequebook(amountBZZ)
    this.console.log(createKeyValue('Tx', response.toHex()))
    this.console.quiet(response.toHex())
  }
}
