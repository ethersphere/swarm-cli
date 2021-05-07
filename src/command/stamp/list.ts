import { LeafCommand } from 'furious-commander'
import { RootCommand } from '../root-command'

export class List extends RootCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly aliases = ['ls']

  public readonly description = 'List postage stamps'

  public async run(): Promise<void> {
    super.init()

    this.console.info(`Listing postage stamps...`)
  }
}
