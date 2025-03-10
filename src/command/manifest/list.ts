import { MantarayNode, Reference } from '@ethersphere/bee-js'
import chalk from 'chalk'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { makeBzzAddress } from '../../utils/bzz-address'
import { RootCommand } from '../root-command'

export class List extends RootCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly alias = 'ls'

  public readonly description = 'List manifest content'

  @Argument({ key: 'address', description: 'Manifest reference (with optional path)', required: true })
  public bzzUrl!: string

  @Option({ key: 'print-bzz', description: 'Print /bzz urls', type: 'boolean' })
  public printBzz!: boolean

  @Option({ key: 'print-bytes', description: 'Print /bytes urls', type: 'boolean' })
  public printBytes!: boolean

  public async run(): Promise<void> {
    super.init()
    const address = await makeBzzAddress(this.bee, this.bzzUrl)
    const node = await MantarayNode.unmarshal(this.bee, address.hash)
    await node.loadRecursively(this.bee)

    const nodes = node.collect().filter(x => x.fullPathString.startsWith(address.path || ''))

    if (nodes.length === 0) {
      this.console.error('No files found under the given path')
      exit(1)
    }

    for (const node of nodes) {
      this.console.log(new Reference(node.targetAddress).toHex() + ' ' + node.fullPathString)

      if (this.printBzz) {
        this.console.log(chalk.dim(this.beeApiUrl + '/bzz/' + address.hash + '/' + node.fullPathString))
      }

      if (this.printBytes) {
        this.console.log(chalk.dim(this.beeApiUrl + '/bytes/' + new Reference(node.targetAddress).toHex()))
      }

      if (this.verbose && node.metadata) {
        for (const entry of Object.entries(node.metadata)) {
          if (!entry[1]) {
            continue
          }
          this.console.log(chalk.dim(entry[0] + ': ' + entry[1]))
        }
      }
    }
  }
}
