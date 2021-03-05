import { LeafCommand, Option } from 'furious-commander'
import { Upload as FileUpload } from '../upload'
import { FeedCommand } from './feed-command'

export class Upload extends FeedCommand implements LeafCommand {
  public readonly name = 'upload'

  public readonly description = 'Upload to a feed'

  @Option({ key: 'path', describe: 'Path of the file', required: true })
  public path!: string

  public async run(): Promise<void> {
    super.init()

    const reference = await this.runUpload()
    await this.updateFeedAndPrint(reference)

    this.console.dim('Successfully uploaded to feed.')
  }

  private async runUpload(): Promise<string> {
    const upload = new FileUpload()
    upload.path = this.path
    upload.tagPollingTime = 500
    upload.tagPollingTrials = 15
    upload.beeApiUrl = this.beeApiUrl
    upload.verbosity = this.verbosity
    await upload.run()

    return upload.hash
  }
}
