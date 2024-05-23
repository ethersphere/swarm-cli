import { Aggregation, LeafCommand } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { Upload as FileUpload } from '../upload'
import { FeedCommand } from './feed-command'

export class Upload extends FeedCommand implements LeafCommand {
  public readonly name = 'upload'

  public readonly description = 'Upload to a feed (file or folder)'

  public feedManifest?: string

  @Aggregation(['upload'])
  public fileUpload!: FileUpload

  public async run(): Promise<void> {
    await super.init()

    if (!this.stamp) {
      const stamp = await pickStamp(this.beeDebug, this.console)
      this.stamp = stamp
      this.fileUpload.stamp = stamp
    }

    const reference = await this.runUpload()
    this.feedManifest = await this.updateFeedAndPrint(reference)
    this.console.dim('Successfully uploaded to feed.')
  }

  private async runUpload(): Promise<string> {
    await this.fileUpload.run(true)

    return this.fileUpload.hash
  }
}
