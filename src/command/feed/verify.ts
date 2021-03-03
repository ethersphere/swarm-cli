import { LeafCommand } from 'furious-commander'
import { bold, green } from 'kleur'
import { FeedCommand } from './feed-command'

export class Verify extends FeedCommand implements LeafCommand {
  public readonly name = 'verify'

  public readonly description = 'Verify feed'

  public async run(): Promise<void> {
    super.init()

    const feedReader = await this.getFeedReader()
    const { reference, feedIndex, feedIndexNext } = await feedReader.download()

    this.console.log(bold(`Reference -> ${green(reference)}`))
    this.console.log(bold(`Reference URL -> ${green(`${this.beeApiUrl}/files/${reference}`)}`))
    this.console.log(bold(`Feed Index -> ${green(feedIndex)}`))
    this.console.log(bold(`Next Index -> ${green(feedIndexNext)}`))
  }
}
