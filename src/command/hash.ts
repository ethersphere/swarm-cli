import { MerkleTree, Reference } from '@upcoming/bee-js'
import { readFileSync } from 'fs'
import { Argument, LeafCommand } from 'furious-commander'
import { RootCommand } from './root-command'

export class Hash extends RootCommand implements LeafCommand {
  public readonly name = 'hash'
  public readonly description = 'Print the Swarm hash of a file'

  @Argument({
    key: 'path',
    description: 'Path to the file',
    required: true,
    autocompletePath: true,
  })
  public path!: string

  public async run(): Promise<void> {
    super.init()
    this.console.all(new Reference((await MerkleTree.root(readFileSync(this.path))).hash()).toHex())
  }
}
