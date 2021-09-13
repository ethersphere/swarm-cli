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

    if (this.path.endsWith('/')) {
      this.path = this.path.slice(0, this.path.length - 1)
    }
    const node = await this.initializeNode(this.reference)
    const forks = this.findAllValueForks(node)
    for (const fork of forks) {
      if ([this.path, this.path + '/'].includes(fork.path)) {
        node.removePath(this.encodePath(fork.path))
        break
      }
    }
    await this.saveAndPrintNode(node, this.stamp)
  }
}
