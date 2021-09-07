import { Argument, LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { ManifestCommand } from './manifest-command'

export class Remove extends ManifestCommand implements LeafCommand {
  public readonly name = 'remove'
  public readonly description = 'Remove a path from an existing manifest'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public reference!: string

  @Argument({ key: 'path', description: 'Path of file or folder be removed from the manifest', required: true })
  public path!: string

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.beeDebug, this.console)
    }
    const node = await this.initializeNode(this.reference)
    const forks = this.findAllValueForks(node)
    const map = this.getValueForkMap(forks)
    for (const key of Object.keys(map)) {
      // TODO does it handle empty folders?
      if (key === this.path || key.startsWith(this.path + '/')) {
        node.removePath(this.encodePath(key))
      }
    }
    await this.saveAndPrintNode(node, this.stamp)
  }
}
