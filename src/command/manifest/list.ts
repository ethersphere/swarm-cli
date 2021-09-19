import { Argument, LeafCommand, Option } from 'furious-commander'
import { ManifestCommand } from './manifest-command'

export class List extends ManifestCommand implements LeafCommand {
  public readonly name = 'list'
  public readonly description = 'List manifest content'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public reference!: string

  @Option({ key: 'print-bzz', description: 'Print /bzz urls', type: 'boolean' })
  public printBzz!: boolean

  @Option({ key: 'print-bytes', description: 'Print /bytes urls', type: 'boolean' })
  public printBytes!: boolean

  public async run(): Promise<void> {
    await super.init()
    const node = await this.initializeNode(this.reference)
    const forks = this.findAllValueForks(node)
    for (const fork of forks) {
      if (!fork.node.getEntry) {
        continue
      }

      this.console.log(fork.path + ' -> ' + Buffer.from(fork.node.getEntry).toString('hex'))

      if (this.printBzz) {
        this.console.log(this.beeApiUrl + '/bzz/' + this.reference + '/' + fork.path)
      }

      if (this.printBytes) {
        this.console.log(this.beeApiUrl + '/bytes/' + Buffer.from(fork.node.getEntry).toString('hex'))
      }

      if (this.printBzz || this.printBytes) {
        this.console.log('')
      }
    }
  }
}
