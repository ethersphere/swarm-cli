import { MantarayNode, MerkleTree } from '@upcoming/bee-js'
import { Binary, Optional } from 'cafe-utility'
import chalk from 'chalk'
import { readFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { join } from 'path'
import { pickStamp } from '../../service/stamp'
import { readdirDeepAsync } from '../../utils'
import { BzzAddress } from '../../utils/bzz-address'
import { stampProperties } from '../../utils/option'
import { RootCommand } from '../root-command'

export class Sync extends RootCommand implements LeafCommand {
  public readonly name = 'sync'
  public readonly description = 'Sync a local folder to an existing manifest'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public bzzUrl!: string

  @Argument({ key: 'folder', description: 'Local folder to be synced', required: true })
  public folder!: string

  @Option(stampProperties)
  public stamp!: string

  @Option({
    key: 'remove',
    type: 'boolean',
    description: 'Remove paths that do not exist locally',
  })
  public remove!: boolean

  public async run(): Promise<void> {
    super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

    const address = new BzzAddress(this.bzzUrl)

    const node = await MantarayNode.unmarshal(this.bee, address.hash)
    await node.loadRecursively(this.bee)

    const map = new Map<string, MantarayNode>()
    const nodes = node.collect()
    for (const node of nodes) {
      map.set(node.fullPathString, node)
    }

    const files = await readdirDeepAsync(this.folder, this.folder)

    for (const file of files) {
      const existing = map.get(file)

      if (existing) {
        const localData = readFileSync(join(this.folder, file))
        const rootChunk = await MerkleTree.root(localData)

        if (Binary.equals(rootChunk.hash(), existing.targetAddress)) {
          this.console.log(chalk.gray(file) + ' ' + chalk.blue('UNCHANGED'))
        } else {
          const { reference } = await this.bee.uploadData(this.stamp, localData)
          node.addFork(file, reference)
          this.console.log(chalk.gray(file) + ' ' + chalk.yellow('CHANGED'))
        }
      } else {
        const { reference } = await this.bee.uploadData(this.stamp, readFileSync(join(this.folder, file)))
        node.addFork(file, reference)
        this.console.log(chalk.gray(file) + ' ' + chalk.green('NEW'))
      }
    }

    if (this.remove) {
      for (const node of nodes) {
        if (!files.includes(node.fullPathString)) {
          node.removeFork(node.fullPathString)
          this.console.log(chalk.gray(node.fullPathString) + ' ' + chalk.red('REMOVED'))
        }
      }
    }

    const root = await node.saveRecursively(this.bee, this.stamp)
    this.console.log(root.toHex())
    this.result = Optional.of(root)
  }
}
