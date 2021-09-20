import { Argument, LeafCommand } from 'furious-commander'
import { PinningCommand } from './pinning-command'

export class Reupload extends PinningCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'reupload'

  public readonly description = 'Reupload locally pinned content'

  @Argument({
    key: 'address',
    type: 'hex-string',
    description: 'Pin address, reference of the collection or feed',
    required: true,
    length: 64,
  })
  public address!: string

  public async run(): Promise<void> {
    await super.init()

    this.console.log('Reuploading ' + this.address + '...')
    try {
      await this.bee.reuploadPinnedData(this.address)
      this.console.log('Reuploaded successfully.')
    } catch (error) {
      this.console.printBeeError(error, { notFoundMessage: 'No locally pinned content found with that address.' })
    }
  }
}
