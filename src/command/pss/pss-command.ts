import { Topic } from '@ethersphere/bee-js'
import { Option } from 'furious-commander'
import { RootCommand } from '../root-command'

// TODO: https://github.com/ethersphere/bee/issues/2041
export class PssCommand extends RootCommand {
  public topic!: string

  @Option({
    key: 'topic-string',
    alias: 'T',
    description: 'Construct the topic from human readable strings',
    required: true,
  })
  public topicString!: string

  public init(): void {
    super.init()

    this.topic = Topic.fromString(this.topicString).toHex()
  }
}
