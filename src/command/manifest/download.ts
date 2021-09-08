import { mkdirSync, writeFileSync } from 'fs'
import { Argument, LeafCommand } from 'furious-commander'
import { join, parse } from 'path'
import { directoryExists } from '../../utils'
import { ManifestCommand } from './manifest-command'

export class Download extends ManifestCommand implements LeafCommand {
  public readonly name = 'download'
  public readonly description = 'Download manifest content to a folder'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public reference!: string

  @Argument({ key: 'folder', description: 'Destination folder', required: true })
  public folder!: string

  public async run(): Promise<void> {
    await super.init()

    const node = await this.initializeNode(this.reference)
    const forks = this.findAllValueForks(node)
    for (const fork of forks) {
      if (fork.path.endsWith('/')) {
        continue
      }
      const parsedForkPath = parse(fork.path)
      const data = await this.bee.downloadData(Buffer.from(fork.node.getEntry).toString('hex'))
      this.console.verbose('Downloading ' + fork.path)
      const targetFolder = join(this.folder, parsedForkPath.dir)

      if (!directoryExists(targetFolder)) {
        mkdirSync(targetFolder, { recursive: true })
      }
      writeFileSync(join(this.folder, fork.path), data)
    }
  }
}
