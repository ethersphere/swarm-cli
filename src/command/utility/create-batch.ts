import { Utils } from '@ethersphere/bee-js'
import { Numbers, Strings } from 'cafe-utility'
import { BigNumber, Contract, Event, ethers, providers, Wallet } from 'ethers'
import { LeafCommand, Option } from 'furious-commander'
import { ABI, Contracts, NETWORK_ID } from '../../utils/contracts'
import { eth_getBalance, makeReadySigner } from '../../utils/rpc'
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

    const wallet = new Wallet(this.privateKey)
    const cost = Utils.getStampCost(this.depth, this.amount)
    const signer = await makeReadySigner(wallet.privateKey, this.jsonRpcUrl)

    // Check if wallet has enough BZZ funds before proceeding
    const tokenProxyContract = new Contract(Contracts.bzz, ABI.tokenProxy, signer)
    const bzzContract = new Contract(Contracts.bzz, ABI.bzz, signer)
    const balance = await bzzContract.balanceOf(wallet.address)

    if (balance.lt(cost.toPLURBigInt().toString())) {
      this.console.error(`\nWallet address: 0x${wallet.address} has insufficient BZZ funds.`)
      this.console.error(`Required:  ${cost.toDecimalString()} BZZ`)
      this.console.error(`Available: ${Number(balance) / 10 ** 18} BZZ`)
      process.exit(1)
    }

    // Check if wallet has enough gas (xDAI) to pay for transaction fees
    const provider = new providers.JsonRpcProvider(this.jsonRpcUrl, NETWORK_ID)
    const xDAI = await eth_getBalance(wallet.address, provider)
    const xDAIValue = BigNumber.from(xDAI)

    // Estimate gas costs for approval and batch creation
    const gasPrice = await provider.getGasPrice()
    const approvalGasLimit = BigNumber.from(130000)
    const batchCreationGasLimit = BigNumber.from(1000000)
    const totalGasLimit = approvalGasLimit.add(batchCreationGasLimit)
    const estimatedGasCost = gasPrice.mul(totalGasLimit)

    if (xDAIValue.lt(estimatedGasCost)) {
      this.console.error(`\nWallet address: 0x${wallet.address} has insufficient xDAI funds for gas fees.`)
      this.console.error(
        `Required: ~${ethers.utils.formatEther(estimatedGasCost)} xDAI, Available: ${ethers.utils.formatEther(
          xDAIValue,
        )} xDAI`,
      )
      process.exit(1)
    }

    // Display cost and wait for user confirmation before proceeding
    this.console.log(`Creating a batch will cost ${cost.toDecimalString()} BZZ`)
    this.console.log(`Gas cost: ~${ethers.utils.formatEther(estimatedGasCost)} xDAI`)
    this.console.log(`Your current balance is ${Number(balance) / 10 ** 18} BZZ`)

    // Create a contract instance with allowance method
    const allowanceAbi = [
      {
        type: 'function',
        stateMutability: 'view',
        payable: false,
        outputs: [{ type: 'uint256', name: 'remaining' }],
        name: 'allowance',
        inputs: [
          { type: 'address', name: '_owner' },
          { type: 'address', name: '_spender' },
        ],
        constant: true,
      },
    ]
    const bzzAllowanceContract = new Contract(Contracts.bzz, allowanceAbi, signer)
    const currentAllowance = await bzzAllowanceContract.allowance(wallet.address, Contracts.postageStamp)
    this.console.log(`Current allowance: ${Number(currentAllowance) / 10 ** 18} BZZ`)

    if (!this.yes) {
      this.yes = await this.console.confirm(
        'This command creates an external batch for advanced usage. Do you want to continue?',
      )
    }

    if (!this.yes) {
      return
    }

    // Use the already fetched allowance to determine if approval is necessary
    const requiredAmount = cost.toPLURBigInt().toString()

    if (currentAllowance.lt(requiredAmount)) {
      this.console.log(`Approving spending of ${cost.toDecimalString()} BZZ to ${wallet.address}`)
      const approve = await tokenProxyContract.approve(Contracts.postageStamp, requiredAmount, {
        gasLimit: 130_000,
        type: 2,
        maxFeePerGas: Numbers.make('2gwei'),
        maxPriorityFeePerGas: Numbers.make('1gwei'),
      })
      this.console.log(`Waiting 3 blocks on approval tx ${approve.hash}`)
      await approve.wait(3)
    } else {
      this.console.log(`Approval not needed. Current allowance: ${Number(currentAllowance) / 10 ** 18} BZZ`)
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
