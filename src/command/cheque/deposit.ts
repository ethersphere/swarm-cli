import { Argument, LeafCommand, Option } from 'furious-commander'
import { createKeyValue, errorText } from '../../utils/text'
import { ChequeCommand, VALID_UNITS } from './cheque-command'
import { BZZ } from '@ethersphere/bee-js'
import { exit } from 'process'

export class Deposit extends ChequeCommand implements LeafCommand {
  public readonly name = 'deposit'

  public readonly alias = 'dep'

  public readonly description = 'Deposit tokens from overlay address into chequebook'

  @Argument({
    key: 'amount',
    description: 'Amount of tokens to deposit',
    type: 'bigint',
    required: true,
    minimum: BigInt(1),
  })
  public amount!: bigint

  @Option({
    key: 'unit',
    type: 'string',
    description: `Unit of the amount; choices: ${VALID_UNITS.join(', ')}`,
    default: 'bzz',
  })
  public unit!: string

  public async run(): Promise<void> {
    super.init()

    this.validateUnit()
    const amountInPlur =
      this.unit === 'bzz' ? BZZ.fromDecimalString(this.amount.toString()).toPLURBigInt() : this.amount

    const response = await this.bee.depositTokens(amountInPlur.toString())
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
