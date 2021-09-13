import { readFileSync, statSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { Reference } from 'mantaray-js'
import { join } from 'path'
import { pickStamp } from '../../service/stamp'
import { getFiles } from '../../utils'
import { stampProperties } from '../../utils/option'
import { ManifestCommand } from './manifest-command'

export class Add extends ManifestCommand implements LeafCommand {
  public readonly name = 'add'
  public readonly description = 'Add a file or folder to an existing manifest'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public reference!: string

  @Argument({ key: 'path', description: 'Path to file or folder in local filesystem', required: true })
  public path!: string

  @Option({ key: 'folder', description: 'Folder will prefix the path of the added files in the manifest' })
  public folder!: string

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.beeDebug, this.console)
    }
    const node = await this.initializeNode(this.reference)
    const stat = statSync(this.path)
    const files = await getFiles(this.path)
    for (const file of files) {
      const path = stat.isDirectory() ? join(this.path, file) : this.path
      const reference = await this.bee.uploadData(this.stamp, readFileSync(path))
      node.addFork(
        this.encodePath(this.folder ? join(this.folder, file) : file),
        Buffer.from(reference, 'hex') as Reference,
      )
    }
    await this.saveAndPrintNode(node, this.stamp)
  }
}
