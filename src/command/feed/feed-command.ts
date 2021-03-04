import { FeedReader, FeedWriter } from '@ethersphere/bee-js/dist/feed'
import { Topic } from '@ethersphere/bee-js/dist/feed/topic'
import { Option } from 'furious-commander'
import { exit } from 'process'
import { getWalletFromIdentity } from '../../service/identity'
import { Identity } from '../../service/identity/types'
import { RootCommand } from '../root-command'

export class FeedCommand extends RootCommand {
  @Option({ key: 'identity', describe: 'Name of the identity', required: true })
  public identity!: string

  @Option({ key: 'topic', describe: 'Feed topic', required: true })
  public topic!: string

  @Option({ key: 'password', describe: 'Password for the wallet' })
  public password!: string

  @Option({ key: 'hash-topic', type: 'boolean', describe: 'Hash the topic to 32 bytes' })
  public hashTopic!: boolean

  protected async getFeedWriter(): Promise<FeedWriter> {
    const identity = this.getIdentity()
    const wallet = await getWalletFromIdentity(identity, this.password)
    const topic = this.getTopic()

    return this.bee.makeFeedWriter('sequence', topic, wallet.getPrivateKey())
  }

  protected async getFeedReader(): Promise<FeedReader> {
    const identity = this.getIdentity()
    const wallet = await getWalletFromIdentity(identity, this.password)
    const topic = this.getTopic()

    return this.bee.makeFeedReader('sequence', topic, wallet.getAddressString())
  }

  private getTopic(): string | Topic {
    return this.hashTopic ? this.bee.makeFeedTopic(this.topic) : this.topic
  }

  private getIdentity(): Identity {
    const identity = this.commandConfig.config.identities[this.identity]

    if (!identity) {
      this.console.error(`Invalid identity name: '${this.identity}'`)

      exit(1)
    }

    return identity
  }
}
