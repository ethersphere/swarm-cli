import { LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { createSpinner } from '../../utils/spinner'
import { VerbosityLevel } from '../root-command/command-log'
import { StampCommand } from './stamp-command'
import { calculateAndDisplayCosts, checkBzzBalance, checkXdaiBalance } from '../../utils/bzz-transaction-utils'

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
    super.init()

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

    // Get wallet address
    const { ethereum } = await this.bee.getNodeAddresses()
    const walletAddress = ethereum.toHex()
    
    this.console.log(`Topping up stamp ${this.stamp} of depth ${stamp.depth} with ${this.amount} PLUR.\n`)

    // Calculate costs
    const { bzzCost, estimatedGasCost } = await calculateAndDisplayCosts(
      stamp.depth,
      this.amount,
      bzzBalance.toPLURBigInt(),
      this.console
    )

    this.console.log(`Current price: ${currentPrice.toString()} PLUR per block`)
    this.console.log(`Estimated TTL extension: ~${additionalDaysNumber.toFixed(2)} days`)

    // Check BZZ balance
    const hasSufficientBzz = await checkBzzBalance(
      walletAddress,
      bzzCost.toPLURBigInt(),
      bzzBalance.toPLURBigInt(),
      this.console
    )
    
    if (!hasSufficientBzz) {
      process.exit(1)
    }

    // Check xDAI balance
    const hasSufficientXdai = await checkXdaiBalance(
      walletAddress,
      estimatedGasCost,
      this.console,
    )
    
    if (!hasSufficientXdai) {
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
