import chalk from 'chalk'
import { mkdirSync, writeFileSync } from 'fs'
import { Argument, LeafCommand } from 'furious-commander'
import { join, parse } from 'path'
import { directoryExists } from '../../utils'
import { BzzAddress } from '../../utils/bzz-address'
import { ManifestCommand } from './manifest-command'

export class Download extends ManifestCommand implements LeafCommand {
  public readonly name = 'download'
  public readonly description = 'Download manifest content to a folder'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public bzzUrl!: string

  @Argument({ key: 'destination', description: 'Destination folder' })
  public destination!: string

  public async run(): Promise<void> {
    await super.init()

    const address = new BzzAddress(this.bzzUrl)
    const forks = await this.loadAllValueForks(address.hash, address.path)
    for (const fork of forks) {
      if (!fork.node.getEntry) {
        continue
      }

      if (Buffer.from(fork.node.getEntry).toString('hex') === '0'.repeat(64)) {
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
      this.console.log(chalk.dim(fork.path))
      writeFileSync(join(destination, fork.fsPath), data)
    }
  }
}
