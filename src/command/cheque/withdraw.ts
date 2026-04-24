import { Argument, LeafCommand, Option } from 'furious-commander'
import { createKeyValue, errorText } from '../../utils/text'
import { ChequeCommand, VALID_UNITS } from './cheque-command'
import { exit } from 'process'
import { BZZ } from '@ethersphere/bee-js'

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

  @Option({
    key: 'unit',
    type: 'string',
    description: 'Unit of the amount',
    required: true,
    default: 'bzz',
  })
  public unit!: string

  public async run(): Promise<void> {
    super.init()

    this.validateUnit()
    const amountInPlur =
      this.unit === 'bzz' ? BZZ.fromDecimalString(this.amount.toString()).toPLURBigInt() : this.amount

    const response = await this.bee.withdrawTokens(amountInPlur.toString())
    this.console.log(createKeyValue('Tx', response.toHex()))
    this.console.quiet(response.toHex())
  }

  private validateUnit() {
    if (!VALID_UNITS.includes(this.unit)) {
      this.console.error(errorText(`Invalid unit '${this.unit}'. Valid units are: ${VALID_UNITS.join(', ')}`))
      exit(1)
    }
  }
}
