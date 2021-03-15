import { LeafCommand } from 'furious-commander'
import { bold, green } from 'kleur'
import { FeedCommand } from './feed-command'

export class Print extends FeedCommand implements LeafCommand {
  public readonly name = 'print'

  public readonly description = 'Print feed'

  public async run(): Promise<void> {
    super.init()

    const wallet = await this.getWallet()
    const topic = this.getTopic()
    const reader = this.bee.makeFeedReader('sequence', topic, wallet.getAddressString())
    const { reference, feedIndex, feedIndexNext } = await reader.download()
    const manifest = await this.bee.createFeedManifest('sequence', topic, wallet.getAddressString())

    this.console.log(bold(`Chunk Reference -> ${green(reference)}`))
    this.console.log(bold(`Chunk Reference URL -> ${green(`${this.beeApiUrl}/files/${reference}`)}`))
    this.console.log(bold(`Feed Index -> ${green(feedIndex)}`))
    this.console.log(bold(`Next Index -> ${green(feedIndexNext)}`))
    this.console.log(bold(`Feed Manifest -> ${green(manifest)}`))
    this.console.log(bold(`Feed Manifest URL -> ${green(`${this.beeApiUrl}/bzz/${manifest}/`)}`))
  }
}
