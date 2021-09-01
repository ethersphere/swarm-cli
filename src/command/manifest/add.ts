import { readFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { Reference } from 'mantaray-js'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { ManifestCommand } from './manifest-command'

export class Add extends ManifestCommand implements LeafCommand {
  public readonly name = 'add'
  public readonly description = 'Add a file to an existing manifest'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public reference!: string

  @Argument({ key: 'fs-path', description: 'Path to file in local filesystem', required: true })
  public fsPath!: string

  @Argument({ key: 'manifest-path', description: 'Path to be added to in the manifest', required: true })
  public manifestPath!: string

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()
    if (!this.stamp) {
      this.stamp = await pickStamp(this.beeDebug, this.console)
    }
    const node = await this.initializeNode(this.reference)
    const reference = await this.bee.uploadData(this.stamp, await readFileSync(this.fsPath))
    node.addFork(this.encodePath(this.manifestPath), Buffer.from(reference, 'hex') as Reference)
    await this.saveAndPrintNode(node, this.stamp)
  }
}
