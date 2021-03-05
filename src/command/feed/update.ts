import { LeafCommand, Option } from 'furious-commander'
import { FeedCommand } from './feed-command'

export class Update extends FeedCommand implements LeafCommand {
  public readonly name = 'update'

  public readonly description = 'Update feed'

  @Option({ key: 'reference', describe: 'The new reference', required: true })
  public reference!: string

  public async run(): Promise<void> {
    super.init()

    await this.updateFeedAndPrint(this.reference)

    this.console.dim('Successfully updated feed.')
  }
}
