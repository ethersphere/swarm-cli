import chalk from 'chalk'
import { mkdirSync, writeFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { join, parse } from 'path'
import { directoryExists } from '../../utils'
import { BzzAddress } from '../../utils/bzz-address'
import { ManifestCommand } from './manifest-command'

export class Download extends ManifestCommand implements LeafCommand {
  public readonly name = 'download'
  public readonly description = 'Download manifest content to a folder'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public bzzUrl!: string

  @Option({ key: 'destination', description: 'Destination folder' })
  public destination!: string

  public async run(): Promise<void> {
    await super.init()

    const address = new BzzAddress(this.bzzUrl)
    const node = await this.initializeNode(address.hash)
    const forks = this.findAllValueForks(node)
    for (const fork of forks) {
      if (fork.path.endsWith('/')) {
        continue
      }

      // TODO download single files
      if (address.path && !fork.path.startsWith(address.path + '/')) {
        continue
      }

      if (!fork.node.getEntry) {
        continue
      }
      const parsedForkPath = parse(fork.path)
      const data = await this.bee.downloadData(Buffer.from(fork.node.getEntry).toString('hex'))
      this.console.verbose('Downloading ' + fork.path)
      const destination = this.destination || address.hash
      const destinationFolder = join(destination, parsedForkPath.dir)

      if (!directoryExists(destinationFolder)) {
        mkdirSync(destinationFolder, { recursive: true })
      }
      this.console.log(chalk.gray(fork.path))
      writeFileSync(join(destination, fork.path), data)
    }
  }
}
