import { LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { enrichStamp, printStamp } from '../../service/stamp'
import { EnrichedStamp } from '../../service/stamp/types/stamp'
import { printDivided } from '../../utils/text'
import { CommandLog } from '../root-command/command-log'
import { StampCommand } from './stamp-command'

export class List extends StampCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly alias = 'ls'

  public readonly description = 'List postage stamps'

  @Option({ key: 'least-used', type: 'boolean', description: 'Sort stamps so least used comes first' })
  public leastUsed!: boolean

  @Option({ key: 'limit', type: 'number', minimum: 1, description: 'Limit the amount of printed stamps' })
  public limit!: number

  @Option({ key: 'hide-usage', type: 'boolean', description: 'Do not print usage percentage' })
  public hideUsage!: boolean

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
    await super.init()
    this.console.verbose(`Listing postage stamps...`)

    const stamps = (await this.beeDebug.getAllPostageBatch()) || []

    if (stamps.length === 0) {
      this.console.error('You do not have any stamps.')
      exit(1)
    }

    const enrichedStamps = stamps.map(enrichStamp)

    const filteredStamps = enrichedStamps.filter(x => x.usageNormal >= this.minUsage && x.usageNormal <= this.maxUsage)

    if (filteredStamps.length === 0) {
      exit(1)
    }

    const limitedStamps = filteredStamps.slice(0, this.limit)

    const orderedStamps = this.leastUsed
      ? limitedStamps.sort((a, b) => a.usage - b.usage)
      : limitedStamps.sort((a, b) => b.batchTTL - a.batchTTL)

    printDivided(
      orderedStamps,
      (items: EnrichedStamp, console: CommandLog) => {
        printStamp(items, console, { printUsageInQuiet: !this.hideUsage, showTtl: true })
      },
      this.console,
    )
  }
}
