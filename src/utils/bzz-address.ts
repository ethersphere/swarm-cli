import { Bee } from '@ethersphere/bee-js'
import { ManifestJs } from '@ethersphere/manifest-js'

export class BzzAddress {
  public hash: string
  public path: string | null

  constructor(url: string) {
    if (url.startsWith('bzz://')) {
      url = url.slice(6)
    }

    if (url.includes('//')) {
      throw new Error('Invalid BZZ path: cannot contain multiple continuous slashes')
    }
    const parts = url.split('/')
    this.hash = parts[0].toLowerCase()

    if (!/[a-z0-9]{64,128}/.test(this.hash)) {
      throw new Error('Invalid BZZ hash: expected 64 or 128 long hexadecimal hash')
    }
    const pathParts = parts.slice(1)
    this.path = pathParts.length ? pathParts.join('/') : null
  }
}

export async function makeBzzAddress(bee: Bee, url: string): Promise<BzzAddress> {
  const address = new BzzAddress(url)

  const feedReference = await new ManifestJs(bee).resolveFeedManifest(address.hash)

  if (feedReference) {
    address.hash = feedReference
  }

  return address
}
