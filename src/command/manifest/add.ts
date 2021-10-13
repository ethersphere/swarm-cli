import chalk from 'chalk'
import { readFileSync, statSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { Reference } from 'mantaray-js'
import { join } from 'path'
import { pickStamp } from '../../service/stamp'
import { getFiles } from '../../utils'
import { BzzAddress } from '../../utils/bzz-address'
import { stampProperties } from '../../utils/option'
import { ManifestCommand } from './manifest-command'

export class Add extends ManifestCommand implements LeafCommand {
  public readonly name = 'add'
  public readonly description = 'Add a file or folder to an existing manifest'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public bzzUrl!: string

  @Argument({ key: 'path', description: 'Path to file or folder in local filesystem', required: true })
  public path!: string

  @Option({ key: 'as', description: 'Rename uploaded file' })
  public as!: string

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.beeDebug, this.console)
    }
    const address = new BzzAddress(this.bzzUrl)
    const { node } = await this.initializeNode(address.hash)
    const stat = statSync(this.path)
    const files = await getFiles(this.path)
    for (const file of files) {
      const path = stat.isDirectory() ? join(this.path, file) : this.path
      const { reference } = await this.bee.uploadData(this.stamp, readFileSync(path))
      const remotePath = this.getForkPath(address.path, files, file)
      node.addFork(this.encodePath(remotePath), Buffer.from(reference, 'hex') as Reference)

      if (file === remotePath) {
        this.console.log(chalk.dim(file))
      } else {
        this.console.log(chalk.dim(file + ' -> ' + remotePath))
      }
    }
    await this.saveAndPrintNode(node, this.stamp)
  }

  private getForkPath(prefix: string | null, files: string[], file: string): string {
    const name = files.length === 1 && this.as ? this.as : file

    return prefix ? join(prefix, name) : name
  }
}
