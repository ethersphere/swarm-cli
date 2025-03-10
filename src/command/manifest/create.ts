import { MantarayNode } from '@ethersphere/bee-js'
import { Optional } from 'cafe-utility'
import { LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { RootCommand } from '../root-command'

export class Create extends RootCommand implements LeafCommand {
  public readonly name = 'create'
  public readonly description = 'Create an empty manifest'

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

    const node = new MantarayNode()
    const result = await node.saveRecursively(this.bee, this.stamp)

    this.result = Optional.of(result.reference)

    this.console.log(result.reference.toHex())
  }
}
