import Wallet from 'ethereumjs-wallet'
import { LeafCommand, Option } from 'furious-commander'
import { bold, green } from 'kleur'
import { exit } from 'process'
import { isSimpleWallet, isV3Wallet } from '../../service/identity'
import { Identity } from '../../service/identity/types'
import { pickStamp } from '../../service/stamp'
import { FeedCommand } from './feed-command'

export class Print extends FeedCommand implements LeafCommand {
  public readonly name = 'print'

  public readonly description = 'Print feed'

  @Option({
    key: 'address',
    type: 'hex-string',
    alias: 'a',
    description: 'Public Ethereum Address for feed lookup',
    required: true,
    conflicts: 'identity',
  })
  public address!: string

  public async run(): Promise<void> {
    super.init()

    const topic = this.topic || this.bee.makeFeedTopic(this.topicString)
    this.console.info('Looking up feed topic ' + topic + '...')
    const addressString = this.address || (await this.getAddressString())
    const reader = this.bee.makeFeedReader('sequence', topic, addressString)
    const { reference, feedIndex, feedIndexNext } = await reader.download()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.beeDebug, this.console)
    }

    const manifest = await this.bee.createFeedManifest(this.stamp, 'sequence', topic, addressString)

    this.console.verbose(bold(`Chunk Reference -> ${green(reference)}`))
    this.console.verbose(bold(`Chunk Reference URL -> ${green(`${this.beeApiUrl}/files/${reference}`)}`))
    this.console.verbose(bold(`Feed Index -> ${green(feedIndex)}`))
    this.console.verbose(bold(`Next Index -> ${green(feedIndexNext)}`))
    this.console.verbose(bold(`Feed Manifest -> ${green(manifest)}`))

    this.console.quiet(manifest)
    this.console.log(bold(`Feed Manifest URL -> ${green(`${this.beeApiUrl}/bzz/${manifest}/`)}`))
  }

  private async getAddressString(): Promise<string> {
    const identity = this.commandConfig.config.identities[this.identity]

    if (!identity) {
      this.console.error('No such identity')
      exit(1)
    }

    if (identity) {
      if (this.password) {
        const wallet = await this.getWallet()

        return wallet.getAddressString()
      } else {
        return this.getAddressStringFromIdentity(identity)
      }
    }

    return this.identity
  }

  private getAddressStringFromIdentity(identity: Identity): string {
    const { wallet, identityType } = identity

    if (isV3Wallet(wallet, identityType)) {
      if (!wallet.address) {
        this.console.error('No address in V3 wallet, please provide password so it can be decrypted.')
        exit(1)
      }

      return wallet.address
    } else if (isSimpleWallet(wallet, identityType)) {
      const ethereumWallet = Wallet.fromPrivateKey(Buffer.from(wallet.privateKey, 'hex'))

      return ethereumWallet.getAddressString()
    } else {
      this.console.error('Address type is not supported.')
      exit(1)
    }
  }
}
