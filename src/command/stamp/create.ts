import { BatchId, Utils } from '@upcoming/bee-js'
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

    let capacityInBytes = 0
    let ttlInMillis = 0

    if (!this.capacity) {
      this.console.log('Please provide the total capacity of the postage stamp batch')
      this.console.log('This represents the total size of data that can be uploaded')
      this.console.log('Example: 1GB')
      this.capacity = await this.console.askForValue('Capacity')
      this.console.log('')
    }

    capacityInBytes = Numbers.makeStorage(this.capacity)

    if (!this.ttl) {
      this.console.log('Please provide the time-to-live (TTL) of the postage stamps')
      this.console.log('Defines the duration after which the stamp will expire')
      this.console.log('Example: 1d, 1w, 1month')
      this.ttl = await this.console.askForValue('TTL')
      this.console.log('')
    }

    ttlInMillis = Dates.make(this.ttl)
    const chainState = await this.bee.getChainState()
    const minimumAmount = BigInt(chainState.currentPrice) * BigInt(17280)

    const depth = Utils.getDepthForCapacity(capacityInBytes / 1024 ** 3)
    const amount = (BigInt(ttlInMillis) / BigInt(5_000) + BigInt(1)) * BigInt(chainState.currentPrice)

    if (minimumAmount > amount) {
      this.console.error('The minimum amount for the TTL is 1 day')

      return
    }

    this.console.log('You have provided the following parameters:')
    this.console.log(createKeyValue('Capacity', Numbers.convertBytes(capacityInBytes)))
    this.console.log(createKeyValue('TTL', Dates.secondsToHumanTime(ttlInMillis / 1000)))
    this.console.log('')
    this.console.log(`Your parameters are now converted to Swarm's internal parameters:`)
    this.console.log(createKeyValue('Depth (capacity)', depth))
    this.console.log(createKeyValue('Amount (TTL)', amount.toString()))

    const estimatedCost = Utils.getStampCost(depth, BigInt(amount))
    const estimatedCapacity = Numbers.convertBytes(Utils.getStampMaximumCapacityBytes(depth))
    const estimatedTtl = Utils.getStampTtlSeconds(BigInt(amount), Number(chainState.currentPrice), 5)

    this.console.log('')
    this.console.log(createKeyValue('Estimated cost', `${estimatedCost.toDecimalString} xBZZ`))
    this.console.log(createKeyValue('Estimated capacity', estimatedCapacity))
    this.console.log(createKeyValue('Estimated TTL', Dates.secondsToHumanTime(Number(estimatedTtl))))
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
      const batchId = await this.bee.createPostageBatch(amount.toString(), depth, {
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
