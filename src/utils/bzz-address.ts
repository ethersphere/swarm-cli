export class BzzAddress {
  public hash: string
  public path: string | null
  public folder: boolean

  constructor(url: string) {
    if (url.startsWith('bzz://')) {
      url = url.slice(6)
    }
    const parts = url.split('/')
    this.hash = parts[0].toLowerCase()

    if (!/[a-z0-9]{64,128}/.test(this.hash)) {
      throw new Error('Invalid BZZ address: expected 64 or 128 long hexadecimal hash')
    }
    const pathParts = parts.slice(1).filter(x => x)
    this.path = pathParts.length ? pathParts.join('/') : null
    this.folder = this.path ? url.endsWith('/') : false
  }
}
