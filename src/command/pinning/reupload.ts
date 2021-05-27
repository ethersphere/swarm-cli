import { Argument, LeafCommand } from 'furious-commander'
import { PinningCommand } from './pinning-command'

export class Reupload extends PinningCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'reupload'

  public readonly description = 'Reupload locally pinned content'

  @Argument({ key: 'address', description: 'Pin address, reference of the collection or feed', required: true })
  public address!: string

  public async run(): Promise<void> {
    super.init()

    await this.bee.reuploadPinnedData(this.address)
    this.console.log('Reuploaded successfully')
  }
}
