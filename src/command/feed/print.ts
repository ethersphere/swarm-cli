import { LeafCommand } from 'furious-commander'
import { bold, green } from 'kleur'
import { FeedCommand } from './feed-command'

export class Print extends FeedCommand implements LeafCommand {
  public readonly name = 'print'

  public readonly description = 'Print feed'

  public async run(): Promise<void> {
    super.init()

    const topic = this.getTopic()
    const addressString = await this.getAddressString()
    const reader = this.bee.makeFeedReader('sequence', topic, addressString)
    const { reference, feedIndex, feedIndexNext } = await reader.download()
    const manifest = await this.bee.createFeedManifest('sequence', topic, addressString)

    this.console.verbose(bold(`Chunk Reference -> ${green(reference)}`))
    this.console.verbose(bold(`Chunk Reference URL -> ${green(`${this.beeApiUrl}/files/${reference}`)}`))
    this.console.verbose(bold(`Feed Index -> ${green(feedIndex)}`))
    this.console.verbose(bold(`Next Index -> ${green(feedIndexNext)}`))
    this.console.verbose(bold(`Feed Manifest -> ${green(manifest)}`))

    this.console.quiet(manifest)
    this.console.log(bold(`Feed Manifest URL -> ${green(`${this.beeApiUrl}/bzz/${manifest}/`)}`))
  }

  private async getAddressString(): Promise<string> {
    if (this.commandConfig.config.identities[this.identity]) {
      await this.checkIdentity()
      const wallet = await this.getWallet()

      return wallet.getAddressString()
    }

    return this.identity
  }
}
