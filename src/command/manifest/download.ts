import chalk from 'chalk'
import { mkdirSync, writeFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { Reference } from 'mantaray-js'
import { join, parse } from 'path'
import { directoryExists, referenceToHex } from '../../utils'
import { BzzAddress } from '../../utils/bzz-address'
import { ManifestCommand } from './manifest-command'

export class Download extends ManifestCommand implements LeafCommand {
  public readonly name = 'download'
  public readonly description = 'Download manifest content to a folder'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public bzzUrl!: string

  @Argument({ key: 'destination', description: 'Destination folder' })
  public destination!: string

  @Option({ key: 'stdout', type: 'boolean', description: 'Print to stdout (single files only)' })
  public stdout!: boolean

  public async run(): Promise<void> {
    await super.init()

    const address = new BzzAddress(this.bzzUrl)
    const forks = (await this.loadAllValueForks(address.hash, address.path)).filter(
      fork => fork.node.getEntry && fork.path !== '/',
    )
    for (const fork of forks) {
      const parsedForkPath = parse(fork.path)
      const data = await this.bee.downloadData(referenceToHex(fork.node.getEntry as Reference))

      if (forks.length === 1 && this.stdout) {
        process.stdout.write(data)

        return
      }

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
