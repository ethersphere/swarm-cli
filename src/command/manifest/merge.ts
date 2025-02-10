import { MantarayNode } from '@upcoming/bee-js'
import { Optional } from 'cafe-utility'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { RootCommand } from '../root-command'

export class Merge extends RootCommand implements LeafCommand {
  public readonly name = 'merge'
  public readonly description = 'Merge two manifests'

  @Argument({ key: 'destination', description: 'Destination manifest address', required: true })
  public destination!: string

  @Argument({ key: 'source', description: 'Source manifest address', required: true })
  public source!: string

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }
    const destinationNode = await MantarayNode.unmarshal(this.bee, this.destination)
    const sourceNode = await MantarayNode.unmarshal(this.bee, this.source)
    await sourceNode.loadRecursively(this.bee)
    await destinationNode.loadRecursively(this.bee)

    const nodes = sourceNode.collect()
    for (const node of nodes) {
      destinationNode.addFork(node.fullPathString, node.targetAddress, node.metadata)
    }

    const root = await destinationNode.saveRecursively(this.bee, this.stamp)
    this.console.log(root.toHex())
    this.result = Optional.of(root)
  }
}
