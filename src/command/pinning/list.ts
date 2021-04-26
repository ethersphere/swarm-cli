import { LeafCommand, Option } from 'furious-commander'
import { RootCommand } from '../root-command'

export class List extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'list'

  public readonly aliases = ['ls']

  public readonly description = 'List pinned chunks'

  @Option({ key: 'limit', type: 'number', description: 'Limits the number of item returned.', default: 1000 })
  public limit!: number

  @Option({ key: 'offset', type: 'number', description: 'Offset of the items returned.', default: 0 })
  public offset!: number

  public async run(): Promise<void> {
    super.init()

    if (this.offset === undefined) {
      this.offset = 0
    }

    this.console.info(`Getting pinned chunks ${this.offset} - ${this.offset + this.limit}...`)

    const { chunks } = await this.bee.getPinnedChunks({
      limit: this.limit,
      offset: this.offset,
    })

    this.console.log(`Found ${chunks.length} pinned chunks`)
    this.console.divider()

    for (const chunk of chunks) {
      this.console.log(` - ${chunk.address}`)
      this.console.quiet(chunk.address)
    }
  }
}
