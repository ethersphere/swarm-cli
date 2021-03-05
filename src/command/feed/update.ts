import { LeafCommand, Option } from 'furious-commander'
import { bold, green } from 'kleur'
import { FeedCommand } from './feed-command'

export class Update extends FeedCommand implements LeafCommand {
  public readonly name = 'update'

  public readonly description = 'Update feed'

  @Option({ key: 'reference', describe: 'The new reference', required: true })
  public reference!: string

  public async run(): Promise<void> {
    super.init()

    const feedWriter = await this.getFeedWriter()
    const referenceResponse = await feedWriter.upload(this.reference)

    const url = `${this.beeApiUrl}/bzz/${referenceResponse.reference}`
    this.console.dim('Updating feed was successful!')
    this.console.log(bold(`Reference URL -> ${green(url)}`))
  }
}
