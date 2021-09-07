import { Data } from '@ethersphere/bee-js'
import { loadAllNodes, MantarayFork, MantarayNode, Reference, StorageSaver } from 'mantaray-js'
import { RootCommand } from '../root-command'

interface EnrichedFork extends MantarayFork {
  path: string
  found: boolean
}

export class ManifestCommand extends RootCommand {
  public resultHash!: string

  protected async init(): Promise<void> {
    await super.init()
  }

  protected findAllValueForks(node: MantarayNode, items = [] as EnrichedFork[], prefix = ''): EnrichedFork[] {
    for (const fork of Object.values(node.forks || {})) {
      const path = prefix + Buffer.from(fork.prefix).toString('utf-8')
      Reflect.set(fork, 'path', path)

      if (fork.node.getType !== 4) {
        items.push(fork as EnrichedFork)
      }

      if (fork.node.isEdgeType()) {
        this.findAllValueForks(fork.node, items, path)
      }
    }

    return items
  }

  protected getValueForkMap(forks: EnrichedFork[]): Record<string, EnrichedFork> {
    const target: Record<string, EnrichedFork> = {}
    for (const fork of forks) {
      target[fork.path] = fork
    }

    return target
  }

  protected createSaver(stamp: string): StorageSaver {
    const bee = this.bee

    return async (data: Uint8Array) => {
      const reference = await bee.uploadData(stamp, data)

      return Buffer.from(reference, 'hex') as Reference
    }
  }

  protected load(reference: Uint8Array): Promise<Data> {
    return this.bee.downloadData(Buffer.from(reference).toString('hex'))
  }

  protected encodePath(path: string): Uint8Array {
    return new TextEncoder().encode(path)
  }

  protected async initializeNode(reference: string): Promise<MantarayNode> {
    const manifest = await this.bee.downloadData(reference)
    const node = new MantarayNode()
    node.deserialize(manifest)
    await loadAllNodes(this.load.bind(this), node)

    return node
  }

  protected async saveAndPrintNode(node: MantarayNode, stamp: string): Promise<void> {
    const reference = await node.save(this.createSaver(stamp))
    this.resultHash = (reference as Buffer).toString('hex')
    this.console.log(this.resultHash)
  }
}
