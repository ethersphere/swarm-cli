import { Utils } from '@ethersphere/bee-js'
import { makeChunk } from '@fairdatasociety/bmt-js'
import { Binary } from 'cafe-utility'
import Wallet from 'ethereumjs-wallet'
import { LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { isSimpleWallet, isV3Wallet } from '../../service/identity'
import { Identity } from '../../service/identity/types'
import { getFieldOrNull } from '../../utils'
import { createSpinner } from '../../utils/spinner'
import { createKeyValue } from '../../utils/text'
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

  @Option({ key: 'list', type: 'boolean', description: 'List all updates' })
  public list!: boolean

  public async run(): Promise<void> {
    await super.init()

    if (!this.address) {
      const wallet = await this.getWallet()
      this.address = wallet.getAddressString()
    }

    const topic = this.topic || this.bee.makeFeedTopic(this.topicString)

    // construct the feed manifest chunk
    const body = Binary.concatBytes(
      new Uint8Array(32),
      new Uint8Array([
        0x57, 0x68, 0xb3, 0xb6, 0xa7, 0xdb, 0x56, 0xd2, 0x1d, 0x1a, 0xbf, 0xf4, 0x0d, 0x41, 0xce, 0xbf, 0xc8, 0x34,
        0x48, 0xfe, 0xd8, 0xd7, 0xe9, 0xb0, 0x6e, 0xc0, 0xd3, 0xb0, 0x73, 0xf2, 0x8f, 0x20,
      ]),
      new Uint8Array(37),
      new Uint8Array([0x80]),
      new Uint8Array(26),
      new Uint8Array([0x12, 0x01, 0x2f]),
      new Uint8Array(29),
      new Uint8Array([
        0x85, 0x04, 0xf2, 0xa1, 0x07, 0xca, 0x94, 0x0b, 0xea, 0xfc, 0x4c, 0xe2, 0xf6, 0xc9, 0xa9, 0xf0, 0x96, 0x8c,
        0x62, 0xa5, 0xb5, 0x89, 0x3f, 0xf0, 0xe4, 0xe1, 0xe2, 0x98, 0x30, 0x48, 0xd2, 0x76, 0x00, 0xbe,
      ]),
      new TextEncoder().encode(
        `{"swarm-feed-owner":"${this.address}","swarm-feed-topic":"${this.topic}","swarm-feed-type":"Sequence"}`,
      ),
      new Uint8Array(12).fill(0x0a),
    )

    const manifest = Binary.uint8ArrayToHex(makeChunk(body).address())
    this.console.quiet(manifest)

    if (this.quiet) {
      return
    }
    this.console.log(createKeyValue('Feed Manifest URL', `${this.bee.url}/bzz/${manifest}/`))

    const spinner = createSpinner(`Looking up feed topic ${topic}`)
    spinner.start()

    try {
      const addressString = this.address || (await this.getAddressString())
      const reader = this.bee.makeFeedReader('sequence', topic, addressString)
      const { reference, feedIndex, feedIndexNext } = await reader.download()
      spinner.stop()
      this.console.verbose(createKeyValue('Chunk Reference', reference))
      this.console.verbose(createKeyValue('Chunk Reference URL', `${this.bee.url}/bzz/${reference}/`))
      this.console.verbose(createKeyValue('Feed Index', feedIndex as string))
      this.console.verbose(createKeyValue('Next Index', feedIndexNext))
      this.console.verbose(createKeyValue('Feed Manifest', manifest))

      this.console.log(createKeyValue('Topic', `${topic}`))
      const numberOfUpdates = parseInt(feedIndex as string, 16) + 1
      this.console.log(createKeyValue('Number of Updates', numberOfUpdates))

      if (this.list) {
        for (let i = 0; i < numberOfUpdates; i++) {
          const indexBytes = Binary.numberToUint64BE(i)
          const identifier = Utils.keccak256Hash(Binary.hexToUint8Array(topic), indexBytes)
          const owner = Binary.hexToUint8Array(this.address)
          const soc = Binary.uint8ArrayToHex(Utils.keccak256Hash(identifier, owner))
          const chunk = await this.bee.downloadChunk(soc)
          // span + identifier + signature + span
          const cac = Binary.uint8ArrayToHex(chunk.slice(8 + 32 + 65 + 8, 8 + 32 + 65 + 32 + 8))
          this.console.log('')
          this.console.log(createKeyValue(`Update ${i}`, cac))
          this.console.log(`${this.bee.url}/bzz/${cac}/`)
        }
      } else {
        this.console.log('Run with --list to see all updates')
      }
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
