import { Utils } from '@ethersphere/bee-js'
import { Dates, Numbers } from 'cafe-utility'
import { BigNumber } from 'ethers'
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
    description: 'Size of data, e.g. 100MB, 1GB',
    type: 'string',
    required: false,
  })
  public capacity!: string

  @Option({
    key: 'ttl',
    description: 'Time to live of the postage stamp, e.g. 1d, 4w, "6 months", 1y',
    type: 'string',
    required: false,
  })
  public ttl!: string

  @Option({ key: 'immutable', description: 'Disable stamp reuse', type: 'boolean', default: true })
  public immutable!: boolean

  @Option({ key: 'label', description: 'Label of the postage stamp' })
  public label!: string

  public postageBatchId!: string

  public async run(): Promise<void> {
    super.init()

    let capacityInBytes = 0
    let ttlInMillis = 0

    if (!this.capacity) {
      this.console.log('Please provide the capacity of the postage stamp')
      this.console.log('This is the size of the data that can be uploaded with this stamp')
      this.console.log('Example: 100MB, 1GB')
      this.capacity = await this.console.askForValue('Capacity')
      this.console.log('')
    }

    capacityInBytes = Numbers.makeStorage(this.capacity)

    if (!this.ttl) {
      this.console.log('Please provide the time to live of the postage stamp')
      this.console.log('This is the time after which the stamp will expire')
      this.console.log('Example: 1h, 1d, 1w')
      this.ttl = await this.console.askForValue('TTL')
      this.console.log('')
    }

    ttlInMillis = Dates.make(this.ttl)
    const chainState = await this.bee.getChainState()
    const minimumAmount = BigNumber.from(chainState.currentPrice).mul(17280)

    const depth = Utils.getDepthForCapacity(capacityInBytes / 1024 ** 3)
    const amount = BigNumber.from(Math.ceil(ttlInMillis / 5_000) + 1).mul(chainState.currentPrice)

    if (minimumAmount.gt(amount)) {
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

    const estimatedCost = Utils.getStampCostInBzz(depth, Number(amount))
    const estimatedCapacity = Numbers.convertBytes(Utils.getStampMaximumCapacityBytes(depth))
    const estimatedTtl = Utils.getStampTtlSeconds(Number(amount), Number(chainState.currentPrice), 5)

    this.console.log('')
    this.console.log(createKeyValue('Estimated cost', `${estimatedCost.toFixed(3)} xBZZ`))
    this.console.log(createKeyValue('Estimated capacity', estimatedCapacity))
    this.console.log(createKeyValue('Estimated TTL', Dates.secondsToHumanTime(estimatedTtl)))
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
      const batchId = await this.bee.createPostageBatch(amount.toString(), depth, {
        label: this.label,
        immutableFlag: this.immutable,
        waitForUsable: true,
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
