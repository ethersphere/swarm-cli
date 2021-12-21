import chalk from 'chalk'
import fs from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { Reference } from 'mantaray-js'
import { join, parse } from 'path'
import { directoryExists, referenceToHex } from '../../utils'
import { BzzAddress, makeBzzAddress } from '../../utils/bzz-address'
import { createSpinner } from '../../utils/spinner'
import { VerbosityLevel } from '../root-command/command-log'
import { EnrichedFork, ManifestCommand } from './manifest-command'

export class Download extends ManifestCommand implements LeafCommand {
  public readonly name = 'download'
  public readonly description = 'Download manifest content to a folder'

  public address!: BzzAddress

  @Argument({ key: 'address', description: 'Manifest reference (with optional path)', required: true })
  public bzzUrl!: string

  @Argument({ key: 'destination', description: 'Destination folder' })
  public destination!: string

  @Option({ key: 'stdout', type: 'boolean', description: 'Print to stdout (single files only)' })
  public stdout!: boolean

  public async run(): Promise<void> {
    await super.init()

    // can be already set from other command
    if (!this.address) {
      this.address = await makeBzzAddress(this.bee, this.bzzUrl)
    }

    const forks = await this.collectForks(this.address)
    const isSingleFork = forks.length === 1
    for (const fork of forks) {
      await this.downloadFork(fork, this.address, isSingleFork)
    }
  }

  private async downloadFork(fork: EnrichedFork, address: BzzAddress, isSingleFork: boolean): Promise<void> {
    if ((!isSingleFork || !this.stdout) && !this.quiet) {
      if (this.curl) {
        this.console.log(chalk.dim(fork.path))
      } else {
        process.stdout.write(chalk.dim(fork.path))
      }
    }
    const parsedForkPath = parse(fork.path)
    const data = await this.bee.downloadData(referenceToHex(fork.node.getEntry as Reference))

    if (isSingleFork && this.stdout) {
      process.stdout.write(data)

      return
    }

    const destination = this.destination || address.hash
    const destinationFolder = join(destination, parsedForkPath.dir)

    if (!directoryExists(destinationFolder)) {
      await fs.promises.mkdir(destinationFolder, { recursive: true })
    }

    if (!this.quiet && !this.curl) {
      process.stdout.write(' ' + chalk.green('OK') + '\n')
    }
    await fs.promises.writeFile(join(destination, fork.fsPath), data)
  }

  private async collectForks(address: BzzAddress): Promise<EnrichedFork[]> {
    const spinner = createSpinner('Preparing download...')
    try {
      if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
        spinner.start()
      }
      const forks = (await this.loadAllValueForks(address.hash, address.path)).filter(this.isDownloadableNode)

      return forks
    } finally {
      spinner.stop()
    }
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
