import { Argument, LeafCommand } from 'furious-commander'
import { StampCommand } from './stamp-command'

export class Show extends StampCommand implements LeafCommand {
  public readonly name = 'show'

  public readonly aliases = []

  public readonly description = 'Show a specific postage stamp'

  @Argument({ key: 'batch-id', description: 'Batch ID of the postage stamp', required: true })
  public batchId!: string

  public async run(): Promise<void> {
    super.init()

    this.console.verbose(`Looking up postage stamp ${this.batchId}...`)

    const stamp = await this.bee.getStamp(this.batchId)

    this.printStamp(stamp)
  }
}
