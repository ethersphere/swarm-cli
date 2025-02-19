import { Bee, MantarayNode } from '@upcoming/bee-js'
import { CommandLineError } from './error'

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

    if (this.hash.startsWith('0x')) {
      this.hash = this.hash.slice(2)
    }

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

// TODO: what is this function?
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

  const reader = bee.makeFeedReader(topic, owner)
  const response = await reader.download()

  return response.payload.toHex()
}

async function getRootSlashMetadata(bee: Bee, hash: string): Promise<Record<string, string> | null> {
  const node = await MantarayNode.unmarshal(bee, hash)
  await node.loadRecursively(bee)

  const indexNode = node.find('/')

  if (!indexNode || !indexNode.metadata) {
    return null
  }

  return indexNode.metadata
}
