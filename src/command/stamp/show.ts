import { Argument, LeafCommand } from 'furious-commander'
import { StampCommand } from './stamp-command'

export class Show extends StampCommand implements LeafCommand {
  public readonly name = 'show'

  public readonly description = 'Show a specific postage stamp'

  @Argument({ key: 'stamp', description: 'ID of the postage stamp', required: true })
  public stamp!: string

  public async run(): Promise<void> {
    super.init()

    this.console.verbose(`Looking up postage stamp ${this.stamp}...`)

    const stamp = await this.bee.getPostageBatch(this.stamp)

    this.printStamp(stamp)
  }
}
