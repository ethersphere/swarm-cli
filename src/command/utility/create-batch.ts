import { Utils } from '@ethersphere/bee-js'
import { Numbers, Strings } from 'cafe-utility'
import { Contract, Event, Wallet } from 'ethers'
import { LeafCommand, Option } from 'furious-commander'
import { ABI, Contracts } from '../../utils/contracts'
import { makeReadySigner } from '../../utils/rpc'
import { RootCommand } from '../root-command'

export class CreateBatch extends RootCommand implements LeafCommand {
  public readonly name = 'create-batch'

  public readonly description = 'Create a postage batch for a given funded private key'

  @Option({
    key: 'private-key',
    description: 'Private key of the wallet to create a postage batch for',
    type: 'hex-string',
    required: true,
  })
  public privateKey!: string

  @Option({
    key: 'depth',
    description: 'Depth of the postage stamp',
    type: 'number',
    required: true,
    minimum: 17,
    maximum: 255,
  })
  public depth!: number

  @Option({
    key: 'amount',
    description: 'Value per chunk in PLUR, deprecates over time with new blocks mined',
    type: 'bigint',
    required: true,
    minimum: 1,
  })
  public amount!: bigint

  @Option({
    key: 'json-rpc-url',
    type: 'string',
    description: 'Gnosis JSON-RPC URL',
    default: 'https://xdai.fairdatasociety.org',
  })
  public jsonRpcUrl!: string

  public async run(): Promise<void> {
    super.init()

    if (!this.yes) {
      this.yes = await this.console.confirm(
        'This command creates an external batch for advanced usage. Do you want to continue?',
      )
    }

    if (!this.yes) {
      return
    }

    const wallet = new Wallet(this.privateKey)
    const cost = Utils.getStampCost(this.depth, this.amount)
    const signer = await makeReadySigner(wallet.privateKey, this.jsonRpcUrl)

    this.console.log(`Approving spending of ${cost.toDecimalString()} BZZ to ${wallet.address}`)
    const tokenProxyContract = new Contract(Contracts.bzz, ABI.tokenProxy, signer)
    const approve = await tokenProxyContract.approve(Contracts.postageStamp, cost.toPLURBigInt().toString(), {
      gasLimit: 130_000,
      type: 2,
      maxFeePerGas: Numbers.make('2gwei'),
      maxPriorityFeePerGas: Numbers.make('1gwei'),
    })
    this.console.log(`Waiting 3 blocks on approval tx ${approve.hash}`)
    await approve.wait(3)

    this.console.log(`Creating postage batch for ${wallet.address} with depth ${this.depth} and amount ${this.amount}`)
    const postageStampContract = new Contract(Contracts.postageStamp, ABI.postageStamp, signer)
    const createBatch = await postageStampContract.createBatch(
      signer.address,
      this.amount,
      this.depth,
      16,
      `0x${Strings.randomHex(64)}`,
      false,
      {
        gasLimit: 1_000_000,
        type: 2,
        maxFeePerGas: Numbers.make('3gwei'),
        maxPriorityFeePerGas: Numbers.make('2gwei'),
      },
    )
    this.console.log(`Waiting 3 blocks on create batch tx ${createBatch.hash}`)
    const receipt = await createBatch.wait(3)

    const batchId = receipt.events.find((x: Event) => x.address === Contracts.postageStamp).topics[1]
    this.console.log(`Batch created with ID ${batchId}`)
  }
}
