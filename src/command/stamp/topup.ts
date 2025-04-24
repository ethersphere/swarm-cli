import { LeafCommand, Option } from 'furious-commander'
import { Utils } from '@ethersphere/bee-js'
import { BigNumber, providers, ethers } from 'ethers'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { createSpinner } from '../../utils/spinner'
import { NETWORK_ID } from '../../utils/contracts'
import { eth_getBalance } from '../../utils/rpc'
import { VerbosityLevel } from '../root-command/command-log'
import { StampCommand } from './stamp-command'

export class Topup extends StampCommand implements LeafCommand {
  public readonly name = 'topup'

  public readonly description = 'Increase amount of existing postage stamp'

  @Option({
    key: 'amount',
    description: 'Value per chunk in PLUR, deprecates over time with new blocks mined',
    type: 'bigint',
    required: true,
    minimum: 1,
  })
  public amount!: bigint

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

    // Get stamp details to calculate duration extension
    const stamp = await this.bee.getPostageBatch(this.stamp)
    const chainState = await this.bee.getChainState()
    const { bzzBalance } = await this.bee.getWalletBalance()

    // Calculate duration extension (approximate)
    const currentPrice = BigInt(chainState.currentPrice)
    const blocksPerDay = 17280n // ~5 seconds per block
    const additionalDaysNumber = Number(this.amount) / Number(currentPrice * blocksPerDay)

    // Calculate cost in BZZ
    const bzzCost = Utils.getStampCost(stamp.depth, this.amount)

    // Get wallet address
    const { ethereum } = await this.bee.getNodeAddresses()
    const walletAddress = ethereum.toHex()
    const provider = new providers.JsonRpcProvider('https://xdai.fairdatasociety.org', NETWORK_ID)

    // Use a fixed gas estimate instead of dynamic calculation to avoid errors
    const gasPrice = await provider.getGasPrice()
    const gasLimit = BigNumber.from(100000) // Typical gas limit for token operations
    const estimatedGasCost = gasPrice.mul(gasLimit)

    // Display cost information to the user
    this.console.log(`Topping up stamp ${this.stamp} with ${this.amount} PLUR (depth: ${stamp.depth})`)
    this.console.log(`Current price: ${currentPrice.toString()} PLUR per block`)
    this.console.log(`Estimated TTL extension: ~${additionalDaysNumber.toFixed(2)} days`)
    this.console.log(`Stamp cost: ${bzzCost.toDecimalString()} BZZ`)
    this.console.log(`Gas cost: ~${ethers.utils.formatEther(estimatedGasCost)} xDAI`)

    // We already have the wallet address from above

    // Check if wallet has enough BZZ funds before proceeding
    if (bzzBalance.toPLURBigInt() < bzzCost.toPLURBigInt()) {
      this.console.error(`\nWallet address: 0x${walletAddress} has insufficient BZZ funds.`)
      this.console.error(`Required:  ${bzzCost.toDecimalString()} BZZ`)
      this.console.error(`Available: ${bzzBalance.toDecimalString()} BZZ`)
      process.exit(1)
    }

    // Check if wallet has enough gas (xDAI) to pay for transaction fees
    const xDAI = await eth_getBalance(walletAddress, provider)
    const xDAIValue = BigNumber.from(xDAI)

    if (xDAIValue.lt(estimatedGasCost)) {
      this.console.error(`\nWallet address: 0x${walletAddress} has insufficient xDAI funds for gas fees.`)
      this.console.error(
        `Required: ~${ethers.utils.formatEther(estimatedGasCost)} xDAI, Available: ${ethers.utils.formatEther(
          xDAIValue,
        )} xDAI`,
      )
      process.exit(1)
    }

    // Ask for confirmation before proceeding
    if (!this.yes) {
      this.yes = await this.console.confirm('Do you want to proceed with this topup?')
    }

    if (!this.yes) {
      this.console.log('Topup cancelled by user')
      return
    }

    const spinner = createSpinner('Topup in progress. This may take a few minutes.')

    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      spinner.start()
    }

    try {
      await this.bee.topUpBatch(this.stamp, this.amount.toString())
    } finally {
      spinner.stop()
    }

    this.console.log(`Topup finished. Your Bee node will soon synchronize the new values from the blockchain.`)
    this.console.log(`This can take a few minutes until the value is updated.`)
    this.console.log(`Check it later with swarm-cli stamp show ${this.stamp}`)
  }
}
