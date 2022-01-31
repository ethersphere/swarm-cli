import type { Data } from '@ethersphere/bee-js'
import { loadAllNodes, MantarayFork, MantarayNode, Reference, StorageSaver } from 'mantaray-js'
import { join } from 'path'
import { getFieldOrNull, referenceToHex } from '../../utils'
import { CommandLineError } from '../../utils/error'
import { RootCommand } from '../root-command'

// FIXME: review these error messages in mantaray-js
const GENERALISED_ERROR_MESSAGES = [
  'Wrong mantaray version',
  'The serialised input is too short',
  'Wrong reference length. Entry only can be 32 or 64 length in bytes',
]

export interface EnrichedFork extends MantarayFork {
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

    return this.findAllValueForks(
      searchResult.node,
      searchResult.node.isValueType() ? [this.convertToEnrichedFork(searchResult.node, searchResult.prefix)] : [],
      searchResult.prefix,
    )
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

  protected encodePath(path: string): Uint8Array {
    return new TextEncoder().encode(path)
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
      const message: string | null = getFieldOrNull(error, 'message')

      if (message && GENERALISED_ERROR_MESSAGES.includes(message)) {
        throw new CommandLineError('The reference provided is not a valid root manifest hash')
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

  private load(reference: Uint8Array): Promise<Data> {
    return this.bee.downloadData(referenceToHex(reference))
  }

  private createSaver(stamp: string): StorageSaver {
    const bee = this.bee

    return async (data: Uint8Array) => {
      const { reference } = await bee.uploadData(stamp, data)

      return Buffer.from(reference, 'hex') as Reference
    }
  }

  private async getNodeAtReference(reference: string): Promise<MantarayNode> {
    const data = await this.bee.downloadData(reference)
    const node = new MantarayNode()
    node.deserialize(data)

    return node
  }

  private async getDeserializedNode(reference: string, prefix?: string | null): Promise<NodeSearchResult | null> {
    if (prefix) {
      return this.findNodeForPrefix(reference, prefix)
    } else {
      const node = await this.getNodeAtReference(reference)

      return { node, prefix: '' }
    }
  }

  private async findNodeForPrefix(
    reference: string,
    prefix: string,
    currentPath = '',
  ): Promise<NodeSearchResult | null> {
    const node = await this.getNodeAtReference(reference)

    if (!node.forks) {
      return null
    }

    for (const fork of Object.values(node.forks)) {
      const path = currentPath + Buffer.from(fork.prefix).toString('utf-8')

      const reference = referenceToHex(fork.node.getEntry as Reference)

      if (path.startsWith(prefix)) {
        const match = await this.getNodeAtReference(reference)

        return { node: match, prefix: path }
      } else if (prefix.startsWith(path)) {
        return this.findNodeForPrefix(reference, prefix, path)
      }
    }

    return null
  }

  private convertToEnrichedFork(node: MantarayNode, path: string): EnrichedFork {
    return {
      path,
      fsPath: join(...path.split('/')),
      found: false,
      prefix: new Uint8Array(0),
      serialize: () => new Uint8Array(0),
      node,
    }
  }
}
