import { LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
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
    key: 'address-prefix',
    description: 'Odd-length target message address prefix',
    required: true,
  })
  public addressPrefix!: string

  @Option({
    key: 'data',
    description: 'Message to be sent',
    required: true,
  })
  public data!: string

  @Option({
    key: 'recipient',
    description: 'Recipient public key',
  })
  public recipient!: string

  public async run(): Promise<void> {
    super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

    await this.bee.pssSend(this.stamp, this.topic, this.addressPrefix, this.data, this.recipient)
    this.console.log('Message sent successfully.')
  }
}
