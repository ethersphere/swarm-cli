import { Argument, LeafCommand } from 'furious-commander'
import { RootCommand } from '../root-command'

export class Show extends RootCommand implements LeafCommand {
  public readonly name = 'show'

  public readonly aliases = []

  public readonly description = 'Show a specific postage stamp'

  @Argument({ key: 'stamp', description: 'Reference of the postage stamp', required: true })
  public stamp!: string

  public async run(): Promise<void> {
    super.init()

    this.console.info(`Looking up postage stamp ${this.stamp}...`)
  }
}
