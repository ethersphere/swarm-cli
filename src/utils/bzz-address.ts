import { Bee, MantarayNode, MerkleTree } from '@ethersphere/bee-js'
import { Binary } from 'cafe-utility'
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

  try {
    const manifest = await MantarayNode.unmarshal(bee, address.hash)
    await manifest.loadRecursively(bee)

    const resolvedFeed = await manifest.resolveFeed(bee)

    await resolvedFeed.ifPresentAsync(async feed => {
      const merkleTree = await MerkleTree.root(feed.payload.toUint8Array())
      const cacAddress = Binary.uint8ArrayToHex(merkleTree.hash())
      address.hash = cacAddress
    })

    return address
  } catch {
    return address
  }
}
