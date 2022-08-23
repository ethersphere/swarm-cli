import Wallet from 'ethereumjs-wallet'
import { LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { isSimpleWallet, isV3Wallet } from '../../service/identity'
import { Identity } from '../../service/identity/types'
import { pickStamp } from '../../service/stamp'
import { createKeyValue } from '../../utils/text'
import { createSpinner } from '../../utils/spinner'
import { FeedCommand } from './feed-command'
import { ExecException } from 'child_process'

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
    const spinner = createSpinner('Looking up feed topic ' + topic)
    spinner.start()
    try {
      const addressString = this.address || (await this.getAddressString())
      const reader = this.bee.makeFeedReader('sequence', topic, addressString)
      const { reference, feedIndex, feedIndexNext } = await reader.download()

      if (!this.stamp) {
        this.stamp = await pickStamp(this.beeDebug, this.console)
      }

      const { reference: manifest } = await this.bee.createFeedManifest(this.stamp, 'sequence', topic, addressString)

      spinner.stop()
      this.console.verbose(createKeyValue('Chunk Reference', reference))
      this.console.verbose(createKeyValue('Chunk Reference URL', `${this.bee.url}/bzz/${reference}/`))
      this.console.verbose(createKeyValue('Feed Index', feedIndex))
      this.console.verbose(createKeyValue('Next Index', feedIndexNext))
      this.console.verbose(createKeyValue('Feed Manifest', manifest))

      this.console.quiet(manifest)
      this.console.log(createKeyValue('Feed Manifest URL', `${this.bee.url}/bzz/${manifest}/`))
      this.console.log(createKeyValue('Number of Updates', parseInt(feedIndex, 10) + 1))
    } catch (ex: any) {
      spinner.stop()
      this.console.info('Feed topic lookup error:')
      this.console.error(`Status: ${ex.response.status} Message: ${ex.response.statusText}`)
      this.console.error(ex.message)
    } finally {
      if (spinner.isSpinning) {
        spinner.stop()
      }
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
      const ethereumWallet = Wallet.fromPrivateKey(Buffer.from(wallet.privateKey, 'hex'))

      return ethereumWallet.getAddressString()
    } else {
      this.console.error('Address type is not supported.')
      exit(1)
    }
  }
}
