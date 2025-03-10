import { BatchId, Utils } from '@upcoming/bee-js'
import { Dates, Numbers } from 'cafe-utility'
import { BigNumber } from 'ethers'
import { LeafCommand, Option } from 'furious-commander'
import { createSpinner } from '../../utils/spinner'
import { createKeyValue } from '../../utils/text'
import { VerbosityLevel } from '../root-command/command-log'
import { StampCommand } from './stamp-command'

export class Buy extends StampCommand implements LeafCommand {
  public readonly name = 'buy'

  public readonly description = 'Buy postage stamp based on depth and amount'

  @Option({
    key: 'depth',
    description: 'Depth of the postage stamp',
    type: 'number',
    required: true,
    minimum: 17,
    maximum: 255,
  })
  public depth!: number

  @Option({
    key: 'amount',
    description: 'Value per chunk in PLUR, deprecates over time with new blocks mined',
    type: 'bigint',
    required: true,
    minimum: 1,
  })
  public amount!: bigint

  @Option({
    key: 'gas-price',
    description: 'Gas price of the transaction in wei',
    type: 'bigint',
    minimum: 0,
  })
  public gasPrice!: bigint

  @Option({ key: 'immutable', description: 'Disable stamp reuse', type: 'boolean', default: true })
  public immutable!: boolean

  @Option({ key: 'label', description: 'Label of the postage stamp' })
  public label!: string

  @Option({
    key: 'wait-usable',
    description: 'Wait until the postage stamp becomes usable',
    type: 'boolean',
    default: true,
  })
  public waitUsable!: boolean

  // CLASS FIELDS
  public postageBatchId!: BatchId

  public async run(): Promise<void> {
    super.init()

    const chainState = await this.bee.getChainState()
    const minimumAmount = BigNumber.from(chainState.currentPrice).mul(17280)

    if (minimumAmount.gte(BigNumber.from(this.amount))) {
      this.console.error('The amount is too low. The minimum amount is', minimumAmount.add(1).toString())

      return
    }

    const estimatedCost = Utils.getStampCost(this.depth, BigInt(this.amount))
    const estimatedCapacity = Numbers.convertBytes(Utils.getStampEffectiveBytes(this.depth))
    const estimatedTtl = Utils.getStampDuration(BigInt(this.amount), Number(chainState.currentPrice), 5)

    this.console.log(createKeyValue('Estimated cost', `${estimatedCost.toDecimalString()} xBZZ`))
    this.console.log(createKeyValue('Estimated capacity', estimatedCapacity))
    this.console.log(createKeyValue('Estimated TTL', Dates.secondsToHumanTime(estimatedTtl.toSeconds())))
    this.console.log(createKeyValue('Type', this.immutable ? 'Immutable' : 'Mutable'))

    if (this.immutable) {
      this.console.info('At full capacity, an immutable stamp no longer allows new content uploads.')
    } else {
      this.console.info('At full capacity, a mutable stamp allows new content uploads, but overwrites old content.')
    }

    if (!this.quiet && !this.yes) {
      this.yes = await this.console.confirm('Confirm the purchase')
    }

    if (!this.yes && !this.quiet) {
      return
    }

    const spinner = createSpinner('Creating postage batch. This may take up to 5 minutes.')

    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      spinner.start()
    }

    try {
      const batchId = await this.bee.createPostageBatch(this.amount.toString(), this.depth, {
        label: this.label,
        gasPrice: this.gasPrice?.toString(),
        immutableFlag: this.immutable,
        waitForUsable: this.waitUsable === false ? false : true,
      })
      spinner.stop()
      this.console.quiet(batchId.toHex())
      this.console.log(createKeyValue('Stamp ID', batchId.toHex()))
      this.postageBatchId = batchId
    } finally {
      spinner.stop()
    }
  }
}
