import { LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { isHexString } from '../../utils/hex'
import { PssCommand } from './pss-command'

export class Send extends PssCommand implements LeafCommand {
  public readonly name = 'send'

  public readonly description = 'Send to recipient or target with Postal Service for Swarm'

  @Option({
    key: 'stamp',
    description: 'ID of the postage stamp to use',
    required: true,
    noErrors: true,
  })
  public stamp!: string

  @Option({
    key: 'target',
    description: 'Even-length target address prefix',
    required: true,
  })
  public target!: string

  @Option({
    key: 'data',
    description: 'Message to be sent',
    required: true,
  })
  public data!: string

  @Option({
    key: 'recipient',
    description: 'Public PSS key of the recipient',
  })
  public recipient!: string

  public async run(): Promise<void> {
    super.init()

    if (!isHexString(this.target) || this.target.length % 2 !== 0) {
      this.console.error('Target must be an even-length hex string')

      return
    }

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

    this.console.log('Sending PSS message on topic ' + this.topic)

    await this.bee.pssSend(this.stamp, this.topic, this.target, this.data, this.recipient)
    this.console.log('Message sent successfully.')
  }
}
