import { statSync } from 'fs'
import { LeafCommand, Option } from 'furious-commander'
import { join } from 'path'
import { fileExists } from '../../utils'
import { Upload as FileUpload } from '../upload'
import { FeedCommand } from './feed-command'

export class Upload extends FeedCommand implements LeafCommand {
  public readonly name = 'upload'

  public readonly description = 'Upload to a feed'

  @Option({ key: 'path', describe: 'Path of the file', required: true })
  public path!: string

  @Option({
    key: 'index-document',
    describe: 'Default retrieval file on bzz request without provided filepath',
  })
  public indexDocument!: string | undefined

  public async run(): Promise<void> {
    super.init()
    await this.checkIdentity()
    const reference = await this.runUpload()
    await this.updateFeedAndPrint(reference)
    this.console.dim('Successfully uploaded to feed.')
  }

  private async runUpload(): Promise<string> {
    const upload = new FileUpload()
    const stats = statSync(this.path)

    if (stats.isFile()) {
      upload.uploadAsFileList = true
      upload.indexDocument = this.path
    } else {
      if (!this.indexDocument && fileExists(join(this.path, 'index.html'))) {
        this.console.info('Setting --index-document to index.html')
        this.indexDocument = 'index.html'
      }
      upload.indexDocument = this.indexDocument
    }
    upload.path = this.path
    upload.tagPollingTime = 500
    upload.tagPollingTrials = 15
    upload.beeApiUrl = this.beeApiUrl
    upload.verbosity = this.verbosity
    upload.usedFromOtherCommand = true
    await upload.run()

    return upload.hash
  }
}
