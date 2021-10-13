import { LeafCommand, Option } from 'furious-commander'
import { MantarayNode } from 'mantaray-js'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { ManifestCommand } from './manifest-command'

export class Create extends ManifestCommand implements LeafCommand {
  public readonly name = 'create'
  public readonly description = 'Create an empty manifest'

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.beeDebug, this.console)
    }
    const node = new MantarayNode()
    await this.saveAndPrintNode(node, this.stamp)
  }
}
