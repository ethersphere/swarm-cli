import { Argument, LeafCommand } from 'furious-commander'
import { ManifestCommand } from './manifest-command'

export class List extends ManifestCommand implements LeafCommand {
  public readonly name = 'list'
  public readonly description = 'List manifest content'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public reference!: string

  public async run(): Promise<void> {
    await super.init()
    const node = await this.initializeNode(this.reference)
    const forks = this.findAllValueForks(node)
    for (const fork of forks) {
      this.console.log(this.beeApiUrl + '/bzz/' + this.reference + '/' + fork.path)
      this.console.log(this.beeApiUrl + '/bytes/' + Buffer.from(fork.node.getEntry).toString('hex'))
      this.console.log('')
    }
  }
}
