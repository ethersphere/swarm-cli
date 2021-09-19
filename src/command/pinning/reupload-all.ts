import { LeafCommand } from 'furious-commander'
import { handleError } from '../../utils/error'
import { PinningCommand } from './pinning-command'

export class ReuploadAll extends PinningCommand implements LeafCommand {
  public readonly name = 'reupload-all'

  public readonly description = 'Reupload all locally pinned content'

  public async run(): Promise<void> {
    await super.init()

    const chunks = await this.bee.getAllPins()

    const total = chunks.length
    let successful = 0

    this.console.log('Found ' + total + ' chunks to reupload...')

    for (const chunk of chunks) {
      try {
        await this.reuploadOne(chunk)
        successful++
      } catch (error) {
        this.console.error('Failed to reupload ' + chunk)
        handleError(error)
      }
    }

    this.console.log('Reuploaded ' + successful + ' out of ' + total + ' pinned chunks')
    this.console.quiet(successful + '/' + total)
  }

  private async reuploadOne(chunk: string): Promise<void> {
    this.console.log('Reuploading ' + chunk + '...')
    await this.bee.reuploadPinnedData(chunk)
    this.console.log('Reuploaded successfully.')
  }
}
