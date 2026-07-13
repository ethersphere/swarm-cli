import { Argument, LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../service/stamp'
import { stampProperties } from '../utils/option'
import { RootCommand } from './root-command'
import { History } from '../service/history'

export class Reupload extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'reupload'

  public readonly description = 'Reupload and restamp content on the network'

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
    await super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

    this.console.log('Reuploading ' + this.address + '...')
    try {
      await this.bee.reuploadPinnedData(this.stamp, this.address)
      this.console.log('Reuploaded successfully.')

      if (this.commandConfig.config.historyEnabled) {
        const history = new History(this.commandConfig, this.console)
        history.addItem({
          timestamp: Date.now(),
          reference: this.address,
          stamp: this.stamp,
          path: null,
          uploadType: 'reupload',
        })
      }
    } catch (error) {
      this.console.printBeeError(error, { notFoundMessage: 'No content found with that address.' })
    }
  }
}
