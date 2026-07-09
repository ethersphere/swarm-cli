import { BZZ } from '@ethersphere/bee-js'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { createSpinner } from '../../utils/spinner'
import { RootCommand } from '../root-command'
import { VerbosityLevel } from '../root-command/command-log'
import { validateTokenAmount } from '../../utils/validate'

const MIN_DEPOSIT = BZZ.fromDecimalString('10')

export class Deposit extends RootCommand implements LeafCommand {
  public readonly name = 'deposit'

  public readonly description = 'Stake xBZZ for the storage incentives'

  @Argument({
    key: 'amount',
    description: 'Amount of tokens to deposit',
    type: 'decimal-string',
    required: true,
    validate: validateTokenAmount,
  })
  public amount!: string

  @Option({
    key: 'unit',
    type: 'enum',
    description: 'Unit of the amount',
    enum: ['bzz', 'plur'],
    default: 'bzz',
  })
  public unit!: string

  public async run(): Promise<void> {
    super.init()

    const amountBzz = this.unit === 'bzz' ? BZZ.fromDecimalString(this.amount) : BZZ.fromPLUR(this.amount)
    await this.deposit(amountBzz)

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
      const reserveState = await this.bee.getReserveState()
      const reserveCapacityDoubling = reserveState.reserveCapacityDoubling

      if (amount.eq(BZZ.fromDecimalString('10')) && reserveCapacityDoubling > 0) {
        this.yes = await this.console.confirm(
          `It is recommended to stake ${
            10 * 2 ** reserveCapacityDoubling
          } xBZZ with a doubled node. Countinue with 10 xBZZ anyway?`,
        )
      }

      if (!this.yes) {
        exit(1)
      }
      this.yes = await this.console.confirm(
        `You are about to deposit a non-refundable stake of ${amount.toDecimalString()} xBZZ, are you sure you wish to proceed?`,
      )
    }

    if (!this.yes && !this.quiet) {
      exit(1)
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
