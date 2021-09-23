import chalk from 'chalk'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { BzzAddress } from '../../utils/bzz-address'
import { ManifestCommand } from './manifest-command'

export class List extends ManifestCommand implements LeafCommand {
  public readonly name = 'list'
  public readonly aliases = ['ls']
  public readonly description = 'List manifest content'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public bzzUrl!: string

  @Option({ key: 'print-bzz', description: 'Print /bzz urls', type: 'boolean' })
  public printBzz!: boolean

  @Option({ key: 'print-bytes', description: 'Print /bytes urls', type: 'boolean' })
  public printBytes!: boolean

  public async run(): Promise<void> {
    await super.init()
    const address = new BzzAddress(this.bzzUrl)
    const node = await this.initializeNode(address.hash)
    const forks = this.findAllValueForks(node)
    for (const fork of forks) {
      if (!fork.node.getEntry) {
        continue
      }

      const entryHex = Buffer.from(fork.node.getEntry).toString('hex')
      const isEmptyEntry = entryHex === '0'.repeat(64)

      if (!this.verbose && isEmptyEntry) {
        continue
      }

      this.console.log(entryHex + ' ' + this.formatPath(fork.path))

      if (this.verbose && isEmptyEntry) {
        if (fork.node.getMetadata && typeof fork.node.getMetadata === 'object') {
          for (const entry of Object.entries(fork.node.getMetadata)) {
            this.console.dim(chalk.gray(this.formatMetaKey(entry[0]) + ': ' + entry[1]))
          }
        }
      }

      if (this.printBzz) {
        this.console.log(this.beeApiUrl + '/bzz/' + address.hash + '/' + fork.path)
      }

      if (this.printBytes) {
        this.console.log(this.beeApiUrl + '/bytes/' + Buffer.from(fork.node.getEntry).toString('hex'))
      }

      if (this.printBzz || this.printBytes) {
        this.console.log('')
      }
    }
  }

  private formatPath(path: string): string {
    return path === '/' ? path : './' + path
  }

  private formatMetaKey(string: string): string {
    return string
      .split(/ |-/i)
      .map(x => x.slice(0, 1).toUpperCase() + x.slice(1))
      .join(' ')
  }
}
