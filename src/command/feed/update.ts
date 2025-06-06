import { Reference } from '@ethersphere/bee-js'
import { LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { FeedCommand } from './feed-command'

export class Update extends FeedCommand implements LeafCommand {
  public readonly name = 'update'

  public readonly description = 'Update feed'

  @Option(stampProperties)
  public stamp!: string

  @Option({ key: 'reference', alias: 'r', description: 'The new reference', required: true })
  public reference!: string

  public async run(): Promise<void> {
    super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

    await this.updateFeedAndPrint(this.stamp, new Reference(this.reference))
    this.console.dim('Successfully updated feed.')
  }
}
