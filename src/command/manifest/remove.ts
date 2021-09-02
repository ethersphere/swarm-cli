import { Argument, LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { ManifestCommand } from './manifest-command'

export class Remove extends ManifestCommand implements LeafCommand {
  public readonly name = 'remove'
  public readonly description = 'Remove a path from an existing manifest'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public reference!: string

  @Argument({ key: 'path', description: 'Path to be removed from the manifest', required: true })
  public path!: string

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.beeDebug, this.console)
    }
    const node = await this.initializeNode(this.reference)
    node.removePath(this.encodePath(this.path))
    await this.saveAndPrintNode(node, this.stamp)
  }
}
