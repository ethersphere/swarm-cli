import { LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { enrichStamp } from '../../service/stamp'
import { StampCommand } from './stamp-command'

export class List extends StampCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly aliases = ['ls']

  public readonly description = 'List postage stamps'

  @Option({ key: 'least-used', type: 'boolean', description: 'Sort stamps so least used comes first' })
  public leastUsed!: boolean

  @Option({ key: 'limit', type: 'number', minimum: 1, description: 'Limit the amount of printed stamps' })
  public limit!: number

  @Option({
    key: 'max-usage',
    type: 'number',
    minimum: 0,
    maximum: 100,
    description: 'Only list stamps at most this usage percentage',
    default: 100,
  })
  public maxUsage!: number

  @Option({
    key: 'min-usage',
    type: 'number',
    minimum: 0,
    maximum: 100,
    description: 'Only list stamps at least this usage percentage',
    default: 0,
  })
  public minUsage!: number

  public async run(): Promise<void> {
    super.init()

    this.console.verbose(`Listing postage stamps...`)

    const stamps = (await this.bee.getAllPostageBatch()) || []

    if (stamps.length === 0) {
      this.console.info('You do not have any stamps.')
      exit(1)
    }

    const limitedStamps = stamps.slice(0, this.limit)

    const enrichedStamps = limitedStamps.map(enrichStamp)

    const filteredStamps = enrichedStamps.filter(x => x.usageNormal >= this.minUsage && x.usageNormal <= this.maxUsage)

    const orderedStamps = this.leastUsed ? filteredStamps.sort((a, b) => a.usage - b.usage) : filteredStamps
    orderedStamps.forEach(stamp => this.printStamp(stamp))
  }
}
