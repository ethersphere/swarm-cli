import { Topic } from '@ethersphere/bee-js/dist/feed/topic'
import Wallet from 'ethereumjs-wallet'
import { Option } from 'furious-commander'
import { bold, green } from 'kleur'
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

  protected async updateFeedAndPrint(chunkReference: string): Promise<void> {
    this.console.dim('Updating feed...')
    const wallet = await this.getWallet()
    const topic = this.getTopic()
    const writer = this.bee.makeFeedWriter('sequence', topic, wallet.getPrivateKey())
    const { reference } = await writer.upload(chunkReference)
    const manifest = await this.bee.createFeedManifest('sequence', topic, wallet.getAddressString())

    this.console.log(bold(`Chunk Reference -> ${green(chunkReference)}`))
    this.console.log(bold(`Chunk Reference URL -> ${green(`${this.beeApiUrl}/files/${chunkReference}`)}`))
    this.console.log(bold(`Feed Reference -> ${green(reference)}`))
    this.console.log(bold(`Feed Manifest -> ${green(manifest)}`))
    this.console.log(bold(`Feed Manifest URL -> ${green(`${this.beeApiUrl}/bzz/${manifest}/`)}`))
  }

  protected getTopic(): string | Topic {
    if (!this.hashTopic) {
      this.enforceValidHexTopic()
    }

    return this.hashTopic ? this.bee.makeFeedTopic(this.topic) : this.topic
  }

  protected async getWallet(): Promise<Wallet> {
    const identity = this.getIdentity()
    const wallet = await getWalletFromIdentity(identity, this.password)

    return wallet
  }

  private enforceValidHexTopic(): void {
    const hasCorrectLength = this.topic.startsWith('0x') ? this.topic.length === 66 : this.topic.length === 64
    const hasCorrectPattern = new RegExp(/^(0x)?[a-f0-9]+$/g).test(this.topic)

    if (!hasCorrectLength || !hasCorrectPattern) {
      this.console.error('Error parsing topic!')
      this.console.log('You can have it hashed to 32 bytes by passing the --hash-topic option.')
      this.console.log('To provide the 32 bytes, please specify it in lower case hexadecimal format.')
      this.console.log('The 0x prefix may be omitted.')
      exit(1)
    }
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
