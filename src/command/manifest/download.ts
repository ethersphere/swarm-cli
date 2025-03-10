import { MantarayNode } from '@upcoming/bee-js'
import chalk from 'chalk'
import fs from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { join, parse } from 'path'
import { exit } from 'process'
import { directoryExists } from '../../utils'
import { BzzAddress, makeBzzAddress } from '../../utils/bzz-address'
import { RootCommand } from '../root-command'

export class Download extends RootCommand implements LeafCommand {
  public readonly name = 'download'
  public readonly description = 'Download manifest content to a folder'

  public address!: BzzAddress

  @Argument({ key: 'address', description: 'Manifest reference (with optional path)', required: true })
  public bzzUrl!: string

  @Argument({ key: 'destination', description: 'Destination folder' })
  public destination!: string

  @Option({ key: 'stdout', type: 'boolean', description: 'Print to stdout (single files only)' })
  public stdout!: boolean

  @Option({ key: 'act', type: 'boolean', description: 'Download with ACT', default: false })
  public act!: boolean

  @Option({ key: 'act-timestamp', type: 'string', description: 'ACT history timestamp', default: '1' })
  public actTimestamp!: string

  // required if act is true
  @Option({ key: 'act-history-address', type: 'string', description: 'ACT history address', required: { when: 'act' } })
  public actHistoryAddress!: string

  // required if act is true
  @Option({ key: 'act-publisher', type: 'string', description: 'ACT publisher', required: { when: 'act' } })
  public actPublisher!: string

  public async run(): Promise<void> {
    super.init()

    // can be already set from other command
    if (!this.address) {
      this.address = await makeBzzAddress(this.bee, this.bzzUrl)
    }

    const node = await MantarayNode.unmarshal(this.bee, this.address.hash)
    await node.loadRecursively(this.bee)

    const nodes = node.collect().filter(x => x.fullPathString.startsWith(this.address.path || ''))

    if (nodes.length === 0) {
      this.console.error('No files found under the given path')
      exit(1)
    }

    if (this.stdout && nodes.length > 1) {
      this.stdout = false
    }

    for (const node of nodes) {
      await this.downloadNode(node, this.address)
    }
  }

  private async downloadNode(node: MantarayNode, address: BzzAddress): Promise<void> {
    if (!this.stdout && !this.quiet) {
      if (this.curl) {
        this.console.log(chalk.dim(node.fullPathString))
      } else {
        process.stdout.write(chalk.dim(node.fullPathString))
      }
    }
    const parsedForkPath = parse(node.fullPathString)
    const data = await this.bee.downloadData(node.targetAddress)

    if (this.stdout) {
      process.stdout.write(data.toUtf8())

      return
    }

    const destination = this.destination || address.hash
    const destinationFolder = join(destination, parsedForkPath.dir)

    if (!directoryExists(destinationFolder)) {
      await fs.promises.mkdir(destinationFolder, { recursive: true })
    }

    if (!this.stdout && !this.quiet && !this.curl) {
      process.stdout.write(' ' + chalk.green('OK') + '\n')
    }
    await fs.promises.writeFile(join(destination, node.fullPathString), data.toUint8Array())
  }
}
