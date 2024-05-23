import Wallet from 'ethereumjs-wallet'
import { LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { isSimpleWallet, isV3Wallet } from '../../service/identity'
import { Identity } from '../../service/identity/types'
import { pickStamp } from '../../service/stamp'
import { getFieldOrNull } from '../../utils'
import { createSpinner } from '../../utils/spinner'
import { createKeyValue } from '../../utils/text'
import { FeedCommand } from './feed-command'
import { FetchFeedUpdateResponse } from '@ethersphere/bee-js/dist/types/modules/feed'

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
    await super.init()

    const topic = this.topic || this.bee.makeFeedTopic(this.topicString)
    const index: number | undefined = this.index
    const spinner = createSpinner(`Looking up feed topic ${topic}`)
    spinner.start()
    try {
      const addressString = this.address || (await this.getAddressString())
      const reader = this.bee.makeFeedReader('sequence', topic, addressString)
      
      let result: FetchFeedUpdateResponse | null = null;
      if (index === undefined) {
        // Index was not specified
        result = await reader.download()
      } else {
        // Index was specified
        // typeof index is string, and we don't understand why. This is why we are doing this conversion.
        result = await reader.download({ index: Number(index) })
      }
      if (!result) throw Error('Error downloading feed update')
      const { reference, feedIndex, feedIndexNext } = result;

      if (!this.stamp) {
        spinner.stop()
        this.stamp = await pickStamp(this.beeDebug, this.console)
        spinner.start()
      }

      const { reference: manifest } = await this.bee.createFeedManifest(this.stamp, 'sequence', topic, addressString)

      spinner.stop()
      this.console.verbose(createKeyValue('Chunk Reference', reference))
      this.console.verbose(createKeyValue('Chunk Reference URL', `${this.bee.url}/bzz/${reference}/`))
      this.console.verbose(createKeyValue('Feed Index', feedIndex as string))
      this.console.verbose(createKeyValue('Next Index', feedIndexNext))
      this.console.verbose(createKeyValue('Feed Manifest', manifest))

      this.console.quiet(manifest)
      this.console.log(createKeyValue('Topic', `${topic}`))
      this.console.log(createKeyValue('Feed Manifest URL', `${this.bee.url}/bzz/${manifest}/`))
      this.console.log(createKeyValue('Number of Updates', parseInt(feedIndex as string, 16) + 1))
    } catch (error) {
      spinner.stop()
      const message = getFieldOrNull(error, 'message')
      throw Error(`Feed topic lookup error: ${message || 'unknown'}`)
    } finally {
      spinner.stop()
    }
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
      const privateKey = wallet.privateKey.replace('0x', '')
      const ethereumWallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'))

      return ethereumWallet.getAddressString()
    } else {
      this.console.error('Address type is not supported.')
      exit(1)
    }
  }
}
