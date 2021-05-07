import { Argument, LeafCommand, Option } from 'furious-commander'
import { RootCommand } from '../root-command'

export class Swap extends RootCommand implements LeafCommand {
  public readonly name = 'swap'

  public readonly aliases = []

  public readonly description = 'Swap a postage stamp'

  @Argument({ key: 'stamp', description: 'Reference of the postage stamp', required: true })
  public stamp!: string

  @Option({ key: 'address', description: 'Swap address', required: true })
  public address!: string

  public async run(): Promise<void> {
    super.init()
    this.console.info(`Swapping postage stamp...`)
  }
}
