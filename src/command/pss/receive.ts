import { LeafCommand, Option } from 'furious-commander'
import { PssCommand } from './pss-command'

export class Receive extends PssCommand implements LeafCommand {
  public readonly name = 'receive'

  public readonly description = 'Receive message with Postal Service for Swarm'

  @Option({
    key: 'timeout',
    description: 'Timeout in milliseconds',
    type: 'number',
  })
  public timeout!: number

  public receivedMessage?: string

  public async run(): Promise<void> {
    super.init()

    const data = await this.bee.pssReceive(this.topic, this.timeout)

    this.receivedMessage = data.text()

    this.console.log(this.receivedMessage)
    this.console.quiet(this.receivedMessage)
  }
}
