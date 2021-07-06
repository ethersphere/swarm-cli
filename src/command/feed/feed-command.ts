import { Reference } from '@ethersphere/bee-js'
import Wallet from 'ethereumjs-wallet'
import { Option } from 'furious-commander'
import { exit } from 'process'
import { getWalletFromIdentity, pickIdentity } from '../../service/identity'
import { Identity } from '../../service/identity/types'
import { printEnrichedStamp } from '../../service/stamp'
import { stampProperties, topicProperties, topicStringProperties } from '../../utils/option'
import { createSpinner } from '../../utils/spinner'
import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'
import { VerbosityLevel } from '../root-command/command-log'

interface FeedInfo {
  reference: string
  manifest: string
}

export class FeedCommand extends RootCommand {
  @Option(stampProperties)
  public stamp!: string

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

  protected async updateFeedAndPrint(chunkReference: string): Promise<void> {
    const wallet = await this.getWallet()
    const topic = this.topic || this.bee.makeFeedTopic(this.topicString)
    const { reference, manifest } = await this.writeFeed(wallet, topic, chunkReference)

    this.console.verbose(createKeyValue('Chunk Reference', chunkReference))
    this.console.verbose(createKeyValue('Chunk Reference URL', `${this.beeApiUrl}/files/${chunkReference}`))
    this.console.verbose(createKeyValue('Feed Reference', reference))
    this.console.verbose(createKeyValue('Feed Manifest', manifest))
    this.console.log(createKeyValue('Feed Manifest URL', `${this.beeApiUrl}/bzz/${manifest}/`))

    this.console.quiet(manifest)

    if (!this.quiet) {
      printEnrichedStamp(await this.bee.getPostageBatch(this.stamp), this.console)
    }
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

  private async writeFeed(wallet: Wallet, topic: string, chunkReference: string): Promise<FeedInfo> {
    const spinner = createSpinner('Writing feed...')

    if (this.verbosity !== VerbosityLevel.Quiet) {
      spinner.start()
    }

    try {
      const writer = this.bee.makeFeedWriter('sequence', topic, wallet.getPrivateKey())
      const reference = await writer.upload(this.stamp, chunkReference as Reference)
      const manifest = await this.bee.createFeedManifest(this.stamp, 'sequence', topic, wallet.getAddressString())

      return { reference, manifest }
    } finally {
      spinner.stop()
    }
  }
}
