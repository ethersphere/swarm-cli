import { Argument, LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
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

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

    this.console.log('Reuploading ' + this.address + '...')
    try {
      await this.bee.reuploadPinnedData(this.stamp, this.address)
      this.console.log('Reuploaded successfully.')
    } catch (error) {
      this.console.printBeeError(error, { notFoundMessage: 'No locally pinned content found with that address.' })
    }
  }
}
