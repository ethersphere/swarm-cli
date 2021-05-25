import { LeafCommand } from 'furious-commander'
import { PinningCommand } from './pinning-command'

export class List extends PinningCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'list'

  public readonly aliases = ['ls']

  public readonly description = 'List pinned chunks'

  public async run(): Promise<void> {
    super.init()

    this.console.info('Getting pinned chunks...')

    const chunks = await this.bee.getAllPins()

    this.console.log(`Found ${chunks.length} pinned chunks`)
    this.console.divider()

    for (const chunk of chunks) {
      this.console.log(` - ${chunk}`)
      this.console.quiet(chunk)
    }
  }
}
