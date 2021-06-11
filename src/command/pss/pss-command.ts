import { Option } from 'furious-commander'
import { topicProperties, topicStringProperties } from '../../utils/option'
import { RootCommand } from '../root-command'

export class PssCommand extends RootCommand {
  @Option(topicProperties)
  public topic!: string

  @Option(topicStringProperties)
  public topicString!: string

  public init(): void {
    super.init()

    this.topic = this.topic || this.bee.makeFeedTopic(this.topicString)
  }
}
