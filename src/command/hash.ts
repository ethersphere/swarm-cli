import { makeChunkedFile } from '@fairdatasociety/bmt-js'
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

  public run(): void {
    super.init()
    const rawBinaryFileData = readFileSync(this.path)
    const chunkedFile = makeChunkedFile(rawBinaryFileData)
    const rootChunk = chunkedFile.rootChunk()
    this.console.all(Buffer.from(rootChunk.address()).toString('hex'))
  }
}
