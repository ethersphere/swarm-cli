import { LeafCommand, Option } from 'furious-commander'
import { FeedCommand } from './feed-command'

export class Update extends FeedCommand implements LeafCommand {
  public readonly name = 'update'

  public readonly description = 'Update feed'

  @Option({ key: 'reference', alias: 'r', describe: 'The new reference', required: true })
  public reference!: string

  @Option({ key: 'identity', alias: 'i', describe: 'Name of the identity', required: true })
  public identity!: string

  public async run(): Promise<void> {
    super.init()
    await this.checkIdentity()
    await this.updateFeedAndPrint(this.reference)
    this.console.dim('Successfully updated feed.')
  }
}
