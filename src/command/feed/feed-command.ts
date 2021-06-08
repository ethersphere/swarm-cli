import { Reference } from '@ethersphere/bee-js'
import Wallet from 'ethereumjs-wallet'
import { Option } from 'furious-commander'
import { bold, green } from 'kleur'
import { exit } from 'process'
import { getWalletFromIdentity } from '../../service/identity'
import { Identity } from '../../service/identity/types'
import { stampProperties, topicProperties, topicStringProperties } from '../../utils/option'
import { RootCommand } from '../root-command'

export class FeedCommand extends RootCommand {
  @Option(stampProperties)
  public stamp!: string

  @Option({ key: 'identity', alias: 'i', description: 'Name of the identity', required: true, conflicts: 'address' })
  public identity!: string

  @Option(topicProperties)
  public topic!: string

  @Option(topicStringProperties)
  public topicString!: string

  @Option({ key: 'password', alias: 'P', description: 'Password for the wallet' })
  public password!: string

  protected async updateFeedAndPrint(chunkReference: string): Promise<void> {
    this.console.dim('Updating feed...')
    const wallet = await this.getWallet()
    const topic = this.topic || this.bee.makeFeedTopic(this.topicString)
    const writer = this.bee.makeFeedWriter('sequence', topic, wallet.getPrivateKey())
    const { reference } = await writer.upload(this.stamp, chunkReference as Reference)
    const manifest = await this.bee.createFeedManifest(this.stamp, 'sequence', topic, wallet.getAddressString())

    this.console.verbose(bold(`Chunk Reference -> ${green(chunkReference)}`))
    this.console.verbose(bold(`Chunk Reference URL -> ${green(`${this.beeApiUrl}/files/${chunkReference}`)}`))
    this.console.verbose(bold(`Feed Reference -> ${green(reference)}`))
    this.console.verbose(bold(`Feed Manifest -> ${green(manifest)}`))
    this.console.log(bold(`Feed Manifest URL -> ${green(`${this.beeApiUrl}/bzz/${manifest}/`)}`))

    this.console.quiet(manifest)
  }

  protected async getWallet(): Promise<Wallet> {
    const identity = this.getIdentity()
    const wallet = await getWalletFromIdentity(identity, this.password)

    return wallet
  }

  private getIdentity(): Identity {
    const identity = this.commandConfig.config.identities[this.identity]

    if (!identity) {
      this.console.error(`Invalid identity name: '${this.identity}'`)

      exit(1)
    }

    return identity
  }

  protected async checkIdentity(): Promise<void> {
    try {
      await this.getWallet()
    } catch (error) {
      this.console.error(error.message)
      exit(1)
    }
  }
}
