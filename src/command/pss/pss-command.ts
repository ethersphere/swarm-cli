import { Option } from 'furious-commander'
import { getTopic } from '../../utils'
import { RootCommand } from '../root-command'

export class PssCommand extends RootCommand {
  @Option({
    key: 'topic',
    alias: 't',
    description: 'Feed topic',
    default: '0'.repeat(64),
    defaultDescription: '32 zero bytes',
  })
  public topic!: string

  @Option({ key: 'hash-topic', alias: 'H', type: 'boolean', description: 'Hash the topic to 32 bytes', default: false })
  public hashTopic!: boolean

  public init(): void {
    super.init()

    this.topic = getTopic(this.bee, this.console, this.topic, this.hashTopic)
  }
}
