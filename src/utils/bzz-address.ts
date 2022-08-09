import { Bee } from '@ethersphere/bee-js'
import { MantarayFork, MantarayNode, MetadataMapping } from 'mantaray-js'
import { CommandLineError } from './error'

const INDEX_DOCUMENT_FORK_PREFIX = '47'

export class BzzAddress {
  public hash: string
  public path: string | null

  constructor(url: string) {
    if (url.startsWith('bzz://')) {
      url = url.slice(6)
    }

    if (url.includes('//')) {
      throw new CommandLineError('Invalid BZZ path: cannot contain multiple continuous slashes')
    }
    const parts = url.split('/')
    this.hash = parts[0].toLowerCase()

    if (!/[a-z0-9]{64,128}/.test(this.hash)) {
      throw new CommandLineError('Invalid BZZ hash: expected 64 or 128 long hexadecimal hash')
    }
    const pathParts = parts.slice(1)
    this.path = pathParts.length ? pathParts.join('/') : null
  }
}

export async function makeBzzAddress(bee: Bee, url: string): Promise<BzzAddress> {
  const address = new BzzAddress(url)

  const feedReference = await resolveFeedManifest(bee, address.hash)

  if (feedReference) {
    address.hash = feedReference
  }

  return address
}

async function resolveFeedManifest(bee: Bee, hash: string): Promise<string | null> {
  const metadata = await getRootSlashMetadata(bee, hash)

  if (!metadata) {
    return null
  }

  const owner = metadata['swarm-feed-owner']
  const topic = metadata['swarm-feed-topic']

  if (!owner || !topic) {
    return null
  }

  const reader = bee.makeFeedReader('sequence', topic, owner)
  const response = await reader.download()

  return response.reference
}

async function getRootSlashMetadata(bee: Bee, hash: string): Promise<MetadataMapping | null> {
  const data = await bee.downloadData(hash)
  const node = new MantarayNode()
  node.deserialize(data)

  if (!node.forks) {
    return null
  }
  const fork = Reflect.get(node.forks, INDEX_DOCUMENT_FORK_PREFIX) as MantarayFork | undefined

  if (!fork) {
    return null
  }
  const metadataNode = fork.node

  if (!metadataNode.IsWithMetadataType()) {
    return null
  }
  const metadata = metadataNode.getMetadata

  if (!metadata) {
    return null
  }

  return metadata
}
