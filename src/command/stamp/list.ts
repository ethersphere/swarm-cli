import { LeafCommand } from 'furious-commander'
import { StampCommand } from './stamp-command'

export class List extends StampCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly aliases = ['ls']

  public readonly description = 'List postage stamps'

  public async run(): Promise<void> {
    super.init()

    this.console.verbose(`Listing postage stamps...`)

    const stamps = await this.bee.getAllPostageBatch()

    if (stamps === null || stamps.length === 0) {
      this.console.info('You do not have any stamps.')
    } else {
      stamps.forEach(stamp => this.printStamp(stamp))
    }
  }
}
