import { Argument, LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { StampCommand } from './stamp-command'

export class Rename extends StampCommand implements LeafCommand {
  public readonly name = 'rename'

  public readonly description = 'Update the label of a postage stamp'

  @Argument({ key: 'label', description: 'New label for the postage stamp' })
  public label!: string

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

    if (!this.label) {
      this.label = await this.console.askForValue('Please provide a new label for the postage stamp:')
    }

    await this.bee.updatePostageBatchLabel(this.stamp, this.label)

    this.console.log(`Postage stamp ${this.stamp} has been successfully renamed to '${this.label}'`)
    this.console.log(`Check it later with swarm-cli stamp show ${this.stamp}`)
  }
}
