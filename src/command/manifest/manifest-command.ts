import type { Data } from '@ethersphere/bee-js'
import { loadAllNodes, MantarayFork, MantarayNode, Reference, StorageSaver } from 'mantaray-js'
import { join } from 'path'
import { exit } from 'process'
import { RootCommand } from '../root-command'
import { Printer } from '../root-command/printer'

interface EnrichedFork extends MantarayFork {
  path: string
  fsPath: string
  /**
   * Used to indicated which forks have been visited when traversing a manifest
   * E.g. in the sync command, unvisited forks are meant to be removed
   */
  found: boolean
}

interface NodeSearchResult {
  node: MantarayNode
  prefix: string
}

export class ManifestCommand extends RootCommand {
  public resultHash!: string

  protected async init(): Promise<void> {
    await super.init()
  }

  protected async loadAllValueForks(hash: string, path?: string | null): Promise<EnrichedFork[]> {
    const searchResult = await this.initializeNode(hash, path)

    return this.findAllValueForks(searchResult.node, [], searchResult.prefix)
  }

  protected findAllValueForks(node: MantarayNode, items = [] as EnrichedFork[], prefix = ''): EnrichedFork[] {
    for (const fork of Object.values(node.forks || {})) {
      const path = prefix + Buffer.from(fork.prefix).toString('utf-8')

      Reflect.set(fork, 'path', path)
      Reflect.set(fork, 'fsPath', join(...path.split('/')))

      if (fork.node.isValueType()) {
        items.push(fork as EnrichedFork)
      }

      if (fork.node.isEdgeType()) {
        this.findAllValueForks(fork.node, items, path)
      }
    }

    return items
  }

  protected getForksPathMapping(forks: EnrichedFork[]): Record<string, EnrichedFork> {
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
    return this.bee.downloadData(this.decodeReference(reference))
  }

  protected encodePath(path: string): Uint8Array {
    return new TextEncoder().encode(path)
  }

  protected decodeReference(reference: Reference | Uint8Array): string {
    return Buffer.from(reference).toString('hex')
  }

  protected async initializeNode(hash: string, path?: string | null): Promise<NodeSearchResult> {
    try {
      const searchResult = await this.getDeserializedNode(hash, path)

      if (!searchResult) {
        if (path) {
          throw new Error('Could not deserialize or find Mantaray node for reference ' + hash + ' and path ' + path)
        }
        throw new Error('Could not deserialize or find Mantaray node for reference ' + hash)
      }
      await loadAllNodes(this.load.bind(this), searchResult.node)

      return searchResult
    } catch (error: unknown) {
      // FIXME in mantaray-js
      if (Reflect.get(error as Record<string, unknown>, 'message') === 'Wrong mantaray version') {
        Printer.error('The reference provided is not a root manifest hash')
        exit(1)
      } else {
        throw error
      }
    }
  }

  protected async saveAndPrintNode(node: MantarayNode, stamp: string): Promise<void> {
    const reference = await node.save(this.createSaver(stamp))
    this.resultHash = (reference as Buffer).toString('hex')
    this.console.log(this.resultHash)
  }

  private async getNodeForReference(reference: string): Promise<MantarayNode> {
    const data = await this.bee.downloadData(reference)
    const node = new MantarayNode()
    node.deserialize(data)

    return node
  }

  private async getDeserializedNode(reference: string, prefix?: string | null): Promise<NodeSearchResult | null> {
    if (prefix) {
      return this.findNodeForPrefix(reference, prefix)
    } else {
      const manifest = await this.bee.downloadData(reference)
      const node = new MantarayNode()
      node.deserialize(manifest)

      return { node, prefix: '' }
    }
  }

  private async findNodeForPrefix(
    reference: string,
    prefix: string,
    currentPath = '',
  ): Promise<NodeSearchResult | null> {
    const node = await this.getNodeForReference(reference)

    if (!node.forks) {
      return null
    }

    for (const fork of Object.values(node.forks)) {
      const path = currentPath + Buffer.from(fork.prefix).toString('utf-8')

      if (path.startsWith(prefix)) {
        const reference = this.decodeReference(fork.node.getEntry as Reference)
        const match = await this.getNodeForReference(reference)

        return { node: match, prefix: path }
      } else if (prefix.startsWith(path)) {
        return this.findNodeForPrefix(this.decodeReference(fork.node.getEntry as Reference), prefix, path)
      }
    }

    return null
  }
}
