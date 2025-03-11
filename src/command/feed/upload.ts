import { Reference } from '@ethersphere/bee-js'
import { Aggregation, LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { Upload as FileUpload } from '../upload'
import { FeedCommand } from './feed-command'

export class Upload extends FeedCommand implements LeafCommand {
  public readonly name = 'upload'

  public readonly description = 'Upload to a feed'

  public feedManifest?: Reference

  @Aggregation(['upload'])
  public fileUpload!: FileUpload

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    super.init()

    if (!this.stamp) {
      const stamp = await pickStamp(this.bee, this.console)
      this.stamp = stamp
      this.fileUpload.stamp = stamp
    }

    const reference = await this.runUpload()
    this.feedManifest = await this.updateFeedAndPrint(this.stamp, reference)
    this.console.dim('Successfully uploaded to feed.')
  }

  private async runUpload(): Promise<Reference> {
    await this.fileUpload.run(true)

    return this.fileUpload.result.getOrThrow()
  }
}
