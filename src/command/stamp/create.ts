import { BatchId, Duration, Size } from '@ethersphere/bee-js'
import { Dates, Numbers } from 'cafe-utility'
import { LeafCommand, Option } from 'furious-commander'
import { createSpinner } from '../../utils/spinner'
import { createKeyValue } from '../../utils/text'
import { VerbosityLevel } from '../root-command/command-log'
import { StampCommand } from './stamp-command'

export class Create extends StampCommand implements LeafCommand {
  public readonly name = 'create'

  public readonly description = 'Create postage stamp in a simple way'

  @Option({
    key: 'capacity',
    description: 'Size of data, e.g. 1GB',
    type: 'string',
    required: false,
  })
  public capacity!: string

  @Option({
    key: 'ttl',
    description: 'Time to live of the postage stamp, e.g. 1d, 1w, 1month',
    type: 'string',
    required: false,
  })
  public ttl!: string

  @Option({
    key: 'immutable',
    description: 'At full capacity, immutable prevents; mutable allows further uploads, overwriting old data',
    type: 'boolean',
    default: true,
  })
  public immutable!: boolean

  @Option({ key: 'label', description: 'Label of the postage stamp' })
  public label!: string

  public postageBatchId!: BatchId

  public async run(): Promise<void> {
    super.init()

    if (!this.capacity) {
      this.console.log('Please provide the total capacity of the postage stamp batch')
      this.console.log('This represents the total size of data that can be uploaded')
      this.console.log('Example: 1GB')
      this.capacity = await this.console.askForValue('Capacity')
      this.console.log('')
    }

    const size = Size.fromBytes(Numbers.makeStorage(this.capacity))

    if (!this.ttl) {
      this.console.log('Please provide the time-to-live (TTL) of the postage stamps')
      this.console.log('Defines the duration after which the stamp will expire')
      this.console.log('Example: 1d, 1w, 1month')
      this.ttl = await this.console.askForValue('TTL')
      this.console.log('')
    }

    const duration = Duration.fromMilliseconds(Dates.make(this.ttl) + Dates.seconds(5))

    if (duration.toDays() < 1) {
      this.console.error('The minimum TTL is 1 day')

      return
    }

    this.console.log('You have provided the following parameters:')
    this.console.log(createKeyValue('Capacity', size.toFormattedString()))
    this.console.log(createKeyValue('TTL', Dates.secondsToHumanTime(duration.toSeconds())))

    const estimatedCost = await this.bee.getStorageCost(size, duration)
    const { bzzBalance } = await this.bee.getWalletBalance()

    this.console.log('')
    this.console.log(createKeyValue('Cost', `${estimatedCost.toDecimalString()} xBZZ`))
    this.console.log(createKeyValue('Available', `${bzzBalance.toDecimalString()} xBZZ`))
    this.console.log(createKeyValue('Type', this.immutable ? 'Immutable' : 'Mutable'))

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
      const batchId = await this.bee.buyStorage(size, duration, {
        label: this.label,
        immutableFlag: this.immutable,
        waitForUsable: true,
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
