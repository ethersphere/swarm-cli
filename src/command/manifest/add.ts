import { MantarayNode } from '@upcoming/bee-js'
import { Optional } from 'cafe-utility'
import chalk from 'chalk'
import { readFileSync, statSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { join } from 'path'
import { pickStamp } from '../../service/stamp'
import { getFiles } from '../../utils'
import { BzzAddress } from '../../utils/bzz-address'
import { stampProperties } from '../../utils/option'
import { RootCommand } from '../root-command'

export class Add extends RootCommand implements LeafCommand {
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
    super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

    const address = new BzzAddress(this.bzzUrl)
    const node = await MantarayNode.unmarshal(this.bee, address.hash)
    await node.loadRecursively(this.bee)
    const stat = statSync(this.path)
    const files = await getFiles(this.path)
    for (const file of files) {
      const path = stat.isDirectory() ? join(this.path, file) : this.path
      const { reference } = await this.bee.uploadData(this.stamp, readFileSync(path))
      const remotePath = this.getForkPath(address.path, files, file)
      node.addFork(remotePath, reference)

      if (file === remotePath) {
        this.console.log(chalk.dim(file))
      } else {
        this.console.log(chalk.dim(file + ' -> ' + remotePath))
      }
    }
    const root = await node.saveRecursively(this.bee, this.stamp)
    this.console.log(root.reference.toHex())
    this.result = Optional.of(root.reference)
  }

  private getForkPath(prefix: string | null, files: string[], file: string): string {
    const name = files.length === 1 && this.as ? this.as : file

    return prefix ? join(prefix, name) : name
  }
}
