import { Option } from 'furious-commander'
import { topicPassphraseProperties, topicProperties } from '../../utils/option'
import { RootCommand } from '../root-command'

export class PssCommand extends RootCommand {
  @Option(topicProperties)
  public topic!: string

  @Option(topicPassphraseProperties)
  public topicPassphrase!: string

  public init(): void {
    super.init()

    this.topic = this.topic || this.bee.makeFeedTopic(this.topicPassphrase)
  }
}
