import { Utils } from '@ethersphere/bee-js'
import { LeafCommand, Option } from 'furious-commander'
import { secondsToDhms } from '../../utils'
import { createSpinner } from '../../utils/spinner'
import { Storage } from '../../utils/storage'
import { createKeyValue } from '../../utils/text'
import { VerbosityLevel } from '../root-command/command-log'
import { StampCommand } from './stamp-command'

export class Buy extends StampCommand implements LeafCommand {
  public readonly name = 'buy'

  public readonly description = 'Buy postage stamp'

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

  @Option({ key: 'immutable', description: 'Disable stamp reuse', type: 'boolean' })
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
  public postageBatchId!: string

  public async run(): Promise<void> {
    await super.init()

    const estimatedCost = Utils.getStampCostInBzz(this.depth, Number(this.amount))
    const estimatedCapacity = new Storage(Utils.getStampMaximumCapacityBytes(this.depth))
    const estimatedTtl = Utils.getStampTtlSeconds(Number(this.amount))

    this.console.log(createKeyValue('Estimated cost', `${estimatedCost.toFixed(3)} BZZ`))
    this.console.log(createKeyValue('Estimated capacity', estimatedCapacity.toString()))
    this.console.log(createKeyValue('Estimated TTL', secondsToDhms(estimatedTtl)))
    this.console.log(createKeyValue('Type', this.immutable ? 'Immutable' : 'Mutable'))

    if (this.immutable) {
      this.console.info(
        'Once an immutable stamp is maxed out, it disallows further content uploads, thereby safeguarding your previously uploaded content from unintentional overwriting.',
      )
    } else {
      this.console.info(
        'When a mutable stamp reaches full capacity, it still permits new content uploads. However, this comes with the caveat of overwriting previously uploaded content associated with the same stamp.',
      )
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
      const batchId = await this.beeDebug.createPostageBatch(this.amount.toString(), this.depth, {
        label: this.label,
        gasPrice: this.gasPrice?.toString(),
        immutableFlag: this.immutable,
        waitForUsable: this.waitUsable === false ? false : true,
      })
      spinner.stop()
      this.console.quiet(batchId)
      this.console.log(createKeyValue('Stamp ID', batchId))
      this.postageBatchId = batchId
    } finally {
      spinner.stop()
    }
  }
}
