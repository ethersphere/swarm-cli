import { Reference, Topic } from '@ethersphere/bee-js'
import Wallet from 'ethereumjs-wallet'
import { Option } from 'furious-commander'
import { exit } from 'process'
import { getWalletFromIdentity, pickIdentity } from '../../service/identity'
import { Identity } from '../../service/identity/types'
import { printStamp } from '../../service/stamp'
import { topicProperties, topicStringProperties } from '../../utils/option'
import { createSpinner } from '../../utils/spinner'
import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'
import { VerbosityLevel } from '../root-command/command-log'

interface FeedInfo {
  reference: Reference
  manifest: Reference
}

export class FeedCommand extends RootCommand {
  @Option({
    key: 'identity',
    alias: 'i',
    description: 'Name of the identity',
    required: { when: 'quiet' },
    conflicts: 'address',
  })
  public identity!: string

  @Option(topicProperties)
  public topic!: string

  @Option(topicStringProperties)
  public topicString!: string

  @Option({ key: 'password', alias: 'P', description: 'Password for the wallet' })
  public password!: string

  protected async updateFeedAndPrint(stamp: string, chunkReference: Reference): Promise<Reference> {
    const wallet = await this.getWallet()
    const topic = this.topic ? new Topic(this.topic) : Topic.fromString(this.topicString)
    const { reference, manifest } = await this.writeFeed(stamp, wallet, topic, chunkReference)

    this.console.verbose(createKeyValue('Chunk Reference', chunkReference.toHex()))
    this.console.verbose(createKeyValue('Chunk Reference URL', `${this.bee.url}/bzz/${chunkReference}/`))
    this.console.verbose(createKeyValue('Feed Reference', reference.toHex()))
    this.console.verbose(createKeyValue('Feed Manifest', manifest.toHex()))
    this.console.log(createKeyValue('Feed Manifest URL', `${this.bee.url}/bzz/${manifest}/`))

    this.console.quiet(manifest.toHex())

    if (!this.quiet) {
      printStamp(await this.bee.getPostageBatch(stamp), this.console, { shortenBatchId: true })
    }

    return manifest
  }

  protected async getWallet(): Promise<Wallet> {
    const identity = await this.getIdentity()
    const wallet = await getWalletFromIdentity(this.console, this.quiet, identity, this.password)

    return wallet
  }

  private async getIdentity(): Promise<Identity> {
    const { identities } = this.commandConfig.config

    if (this.identity && !identities[this.identity]) {
      if (this.quiet) {
        this.console.error('The provided identity does not exist.')
        exit(1)
      }
      this.console.error('The provided identity does not exist. Please select one that exists.')
    }

    return identities[this.identity] || identities[await pickIdentity(this.commandConfig, this.console)]
  }

  private async writeFeed(stamp: string, wallet: Wallet, topic: Topic, chunkReference: Reference): Promise<FeedInfo> {
    const spinner = createSpinner('Writing feed...')

    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      spinner.start()
    }

    try {
      const writer = this.bee.makeFeedWriter(topic, wallet.getPrivateKey())
      const feedManifestResult = await this.bee.createFeedManifest(stamp, topic, wallet.getAddressString())
      const data = await this.bee.downloadData(chunkReference)
      const { reference } = await writer.uploadPayload(stamp, data.toUint8Array())

      return { reference, manifest: feedManifestResult }
    } finally {
      spinner.stop()
    }
  }
}
