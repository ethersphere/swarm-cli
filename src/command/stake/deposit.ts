import { BZZ } from '@ethersphere/bee-js'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { createSpinner } from '../../utils/spinner'
import { RootCommand } from '../root-command'
import { VerbosityLevel } from '../root-command/command-log'
import { Context } from 'vm'

const MIN_DEPOSIT = BZZ.fromDecimalString('10')

export class Deposit extends RootCommand implements LeafCommand {
  public readonly name = 'deposit'

  public readonly description = 'Stake xBZZ for the storage incentives'

  @Argument({
    key: 'amount',
    description: 'Amount of tokens to deposit',
    type: 'decimal-string',
    required: true,
    validate: (value: unknown, context: Context): string[] => {
      if (context.options.unit === 'bzz') {
        const amount = parseFloat(value as string)

        if (isNaN(amount) || amount <= 0) {
          return [`Invalid amount '${value}'. Amount must be a positive number.`]
        }
      } else {
        try {
          const amount = BigInt(value as string)

          if (amount <= BigInt(0)) {
            return [`Invalid amount '${value}'. Amount must be a positive integer.`]
          }
        } catch (e) {
          return [`Invalid amount '${value}'. Amount must be a positive integer.`]
        }
      }

      return []
    },
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
