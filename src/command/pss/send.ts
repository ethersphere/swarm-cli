import { readFileSync } from 'fs'
import { LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { fileExists } from '../../utils'
import { stampProperties } from '../../utils/option'
import { PssCommand } from './pss-command'

export class Send extends PssCommand implements LeafCommand {
  public readonly name = 'send'

  public readonly description = 'Send a message to a target Bee node with Postage Service for Swarm'

  @Option(stampProperties)
  public stamp!: string

  @Option({
    key: 'target',
    description: 'Overlay address prefix of the target Bee node',
    required: true,
    type: 'hex-string',
  })
  public target!: string

  @Option({
    key: 'data',
    description: 'Text message to send',
    required: true,
    conflicts: 'path',
  })
  public data!: string

  @Option({
    key: 'path',
    description: 'Send raw data from file',
    required: true,
    conflicts: 'data',
  })
  public path!: string

  @Option({
    key: 'recipient',
    description: 'PSS public key of the target Bee node for encryption',
  })
  public recipient!: string

  message?: string | Uint8Array

  public async run(): Promise<void> {
    super.init()

    if (this.path) {
      if (!fileExists(this.path)) {
        this.console.error('There is no file at the specified path')

        return
      }
      this.message = readFileSync(this.path)
    } else {
      this.message = this.data
    }

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

    this.console.log('Sending PSS message on topic ' + this.topic)

    await this.bee.pssSend(this.stamp, this.topic, this.target, this.message, this.recipient)
    this.console.log('Message sent successfully.')
  }
}
