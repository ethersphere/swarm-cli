import { Aggregation, LeafCommand } from 'furious-commander'
import { Upload as FileUpload } from '../upload'
import { FeedCommand } from './feed-command'

export class Upload extends FeedCommand implements LeafCommand {
  public readonly name = 'upload'

  public readonly description = 'Upload to a feed'

  @Aggregation(['upload'])
  public fileUpload!: FileUpload

  public async run(): Promise<void> {
    super.init()
    await this.checkIdentity()
    const reference = await this.runUpload()
    await this.updateFeedAndPrint(reference, this.stamp)
    this.console.dim('Successfully uploaded to feed.')
  }

  private async runUpload(): Promise<string> {
    this.fileUpload.usedFromOtherCommand = true

    await this.fileUpload.run()

    return this.fileUpload.hash
  }
}
