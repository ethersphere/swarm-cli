import { BZZ } from '@ethersphere/bee-js'
import { LeafCommand, Option } from 'furious-commander'
import { createSpinner } from '../../utils/spinner'
import { RootCommand } from '../root-command'
import { VerbosityLevel } from '../root-command/command-log'

const MIN_DEPOSIT = BZZ.fromDecimalString('10')

export class Deposit extends RootCommand implements LeafCommand {
  public readonly name = 'deposit'

  public readonly description = 'Stake xBZZ for the storage incentives'

  @Option({
    key: 'plur',
    description: "Amount of PLUR to add to the node's stake",
    type: 'bigint',
    minimum: BigInt(1),
    conflicts: 'bzz',
  })
  public amountPlur!: bigint | undefined

  @Option({
    key: 'bzz',
    description: "Amount of BZZ to add to the node's stake",
    type: 'string',
    conflicts: 'plur',
  })
  public amountBzz!: string | undefined

  public async run(): Promise<void> {
    super.init()

    if (this.amountPlur) {
      await this.deposit(BZZ.fromPLUR(this.amountPlur))
    } else if (this.amountBzz) {
      await this.deposit(BZZ.fromDecimalString(this.amountBzz))
    }

    this.console.log('Stake deposited successfully!')
    this.console.log('Run `swarm-cli stake status` to check your stake status.')
    this.console.log('')
    this.console.log('Do note it may take a few minutes for the stake to be reflected in the node status.')
  }

  private async deposit(amount: BZZ): Promise<void> {
    const currentStake = await this.bee.getStake()

    if (currentStake.lt(MIN_DEPOSIT) && amount.lt(MIN_DEPOSIT)) {
      if (this.quiet) {
        throw new Error(
          `Insufficient deposit! Initial deposit has to be at least ${MIN_DEPOSIT.toSignificantDigits(1)} xBZZ!`,
        )
      }

      if (
        !(await this.console.confirm(
          `Insufficient deposit! Initial deposit has to be at least ${MIN_DEPOSIT.toSignificantDigits(
            1,
          )} xBZZ! Do you want to increase the deposit to ${MIN_DEPOSIT.toSignificantDigits(1)} xBZZ?`,
        ))
      ) {
        throw new Error(
          `Insufficient deposit! Initial deposit has to be at least ${MIN_DEPOSIT.toSignificantDigits(1)} xBZZ!`,
        )
      }

      amount = MIN_DEPOSIT
    }

    if (!this.quiet && !this.yes) {
      this.yes = await this.console.confirm(
        `You are about to deposit a non-refundable stake of ${amount.toDecimalString()} xBZZ, are you sure you wish to proceed?`,
      )
    }

    if (!this.yes && !this.quiet) {
      return
    }

    const spinner = createSpinner('Depositing stake')

    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      spinner.start()
    }

    try {
      await this.bee.depositStake(amount)
      spinner.stop()
    } catch (e) {
      spinner.stop()
      throw e
    }
  }
}
