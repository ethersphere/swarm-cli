import { writeFileSync } from 'fs'
import { Argument, LeafCommand } from 'furious-commander'
import { join } from 'path'
import { ManifestCommand } from './manifest-command'

export class Download extends ManifestCommand implements LeafCommand {
  public readonly name = 'download'
  public readonly description = 'Download manifest content to a folder'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public reference!: string

  @Argument({ key: 'folder', description: 'Destination folder (must exist)', required: true })
  public folder!: string

  public async run(): Promise<void> {
    await super.init()
    const node = await this.initializeNode(this.reference)
    const forks = this.findAllValueForks(node)
    for (const fork of forks) {
      const data = await this.bee.downloadData(Buffer.from(fork.node.getEntry).toString('hex'))
      writeFileSync(join(this.folder, fork.path), data)
    }
  }
}
