import chalk from 'chalk'
import fs from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { Reference } from 'mantaray-js'
import { join, parse } from 'path'
import { directoryExists, referenceToHex } from '../../utils'
import { BzzAddress } from '../../utils/bzz-address'
import { EnrichedFork, ManifestCommand } from './manifest-command'

export class Download extends ManifestCommand implements LeafCommand {
  public readonly name = 'download'
  public readonly description = 'Download manifest content to a folder'

  @Argument({ key: 'address', description: 'Manifest reference (with optional path)', required: true })
  public bzzUrl!: string

  @Argument({ key: 'destination', description: 'Destination folder' })
  public destination!: string

  @Option({ key: 'stdout', type: 'boolean', description: 'Print to stdout (single files only)' })
  public stdout!: boolean

  public async run(): Promise<void> {
    await super.init()

    const address = new BzzAddress(this.bzzUrl)
    const forks = (await this.loadAllValueForks(address.hash, address.path)).filter(this.isDownloadableNode)
    const isSingleFork = forks.length === 1
    for (const fork of forks) {
      await this.downloadFork(fork, address, isSingleFork)
    }
  }

  private async downloadFork(fork: EnrichedFork, address: BzzAddress, isSingleFork: boolean): Promise<void> {
    const parsedForkPath = parse(fork.path)
    const data = await this.bee.downloadData(referenceToHex(fork.node.getEntry as Reference))

    if (isSingleFork && this.stdout) {
      process.stdout.write(data)

      return
    }

    this.console.verbose('Downloading ' + fork.path)
    const destination = this.destination || address.hash
    const destinationFolder = join(destination, parsedForkPath.dir)

    if (!directoryExists(destinationFolder)) {
      await fs.promises.mkdir(destinationFolder, { recursive: true })
    }
    this.console.log(chalk.dim(fork.path))
    await fs.promises.writeFile(join(destination, fork.fsPath), data)
  }

  private isDownloadableNode(fork: EnrichedFork): boolean {
    if (!fork.node) {
      return false
    }
    const metadata = fork.node.getMetadata

    if (metadata && (metadata['website-index-document'] || metadata['website-error-document'])) {
      return false
    }

    return fork.node.isValueType()
  }
}
