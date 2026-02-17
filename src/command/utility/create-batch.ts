import { Numbers, Strings } from 'cafe-utility'
import { BigNumber, Contract, Event, Wallet } from 'ethers'
import { LeafCommand, Option } from 'furious-commander'
import { ABI, Contracts } from '../../utils/contracts'
import { makeReadySigner } from '../../utils/rpc'
import { RootCommand } from '../root-command'
import { calculateAndDisplayCosts, checkBzzBalance, checkXdaiBalance, checkAndApproveAllowance } from '../../utils/bzz-transaction-utils'

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

    const wallet = new Wallet(this.privateKey)
    const signer = await makeReadySigner(wallet.privateKey, this.jsonRpcUrl)

    // Get BZZ balance
    const bzzContract = new Contract(Contracts.bzz, ABI.bzz, signer)
    const balance = await bzzContract.balanceOf(wallet.address)
    const bzzBalance = BigNumber.from(balance)
    
    // Calculate costs
    const { bzzCost, estimatedGasCost } = await calculateAndDisplayCosts(
      this.depth,
      this.amount,
      bzzBalance.toBigInt(),
      this.console
    )

    // Check BZZ balance
    const hasSufficientBzz = await checkBzzBalance(
      wallet.address,
      bzzCost.toPLURBigInt(),
      bzzBalance.toBigInt(),
      this.console
    )
    
    if (!hasSufficientBzz) {
      process.exit(1)
    }

    // Check xDAI balance
    const hasSufficientXdai = await checkXdaiBalance(
      wallet.address,
      estimatedGasCost,
      this.console
    )
    
    if (!hasSufficientXdai) {
      process.exit(1)
    }

    if (!this.yes) {
      this.yes = await this.console.confirm(
        'This command creates an external batch for advanced usage. Do you want to continue?',
      )
    }

    if (!this.yes) {
      return
    }

    // Check and approve allowance if needed
    const requiredAmount = bzzCost.toPLURBigInt().toString()
    const approved = await checkAndApproveAllowance(
      this.privateKey,
      requiredAmount,
      this.console
    )
    
    if (!approved) {
      this.console.error('Failed to approve BZZ spending')
      process.exit(1)
    }

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
