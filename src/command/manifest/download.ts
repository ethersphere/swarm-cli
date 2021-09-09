import { mkdirSync, writeFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { join, parse } from 'path'
import { directoryExists } from '../../utils'
import { ManifestCommand } from './manifest-command'

export class Download extends ManifestCommand implements LeafCommand {
  public readonly name = 'download'
  public readonly description = 'Download manifest content to a folder'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public reference!: string

  @Argument({ key: 'destination', description: 'Destination folder', required: true })
  public destination!: string

  @Option({ key: 'folder', description: 'Only download this folder from the manifest' })
  public folder!: string

  public async run(): Promise<void> {
    await super.init()

    if (this.folder && !this.folder.endsWith('/')) {
      this.folder = this.folder + '/'
    }

    const node = await this.initializeNode(this.reference)
    const forks = this.findAllValueForks(node)
    for (const fork of forks) {
      if (fork.path.endsWith('/')) {
        continue
      }

      if (this.folder && !fork.path.startsWith(this.folder)) {
        continue
      }
      const parsedForkPath = parse(fork.path)
      const data = await this.bee.downloadData(Buffer.from(fork.node.getEntry).toString('hex'))
      this.console.verbose('Downloading ' + fork.path)
      const destinationFolder = join(this.destination, parsedForkPath.dir)

      if (!directoryExists(destinationFolder)) {
        mkdirSync(destinationFolder, { recursive: true })
      }
      writeFileSync(join(this.destination, fork.path), data)
    }
  }
}
