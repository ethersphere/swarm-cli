import { Argument, LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { ManifestCommand } from './manifest-command'

export class Merge extends ManifestCommand implements LeafCommand {
  public readonly name = 'merge'
  public readonly description = 'Merge two manifests'

  @Argument({ key: 'destination', description: 'Destination manifest address', required: true })
  public destination!: string

  @Argument({ key: 'source', description: 'Source manifest address', required: true })
  public source!: string

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.beeDebug, this.console)
    }
    const destinationNode = (await this.initializeNode(this.destination)).node
    const sourceNode = (await this.initializeNode(this.source)).node
    const forks = this.findAllValueForks(sourceNode)
    for (const fork of forks) {
      if (!fork.node.getEntry) {
        continue
      }
      destinationNode.addFork(this.encodePath(fork.path), fork.node.getEntry)
    }
    await this.saveAndPrintNode(destinationNode, this.stamp)
  }
}
