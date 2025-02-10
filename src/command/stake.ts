import { LeafCommand, Option } from 'furious-commander'
import { createSpinner } from '../utils/spinner'
import { createKeyValue } from '../utils/text'
import { RootCommand } from './root-command'
import { VerbosityLevel } from './root-command/command-log'

const MIN_INITIAL_STAKE_PLUR = BigInt('100000000000000000')
const MIN_INITIAL_STAKE_BZZ = 10

export class Stake extends RootCommand implements LeafCommand {
  public readonly name = 'stake'

  public readonly description = `Manages nodes stake`

  @Option({
    key: 'deposit',
    description: "Amount of PLUR to add to the node's stake",
    type: 'bigint',
    minimum: BigInt(1),
  })
  public amount!: bigint | undefined

  private async deposit(amount: bigint): Promise<void> {
    const currentStake = (await this.bee.getStake()).toPLURBigInt()

    if (!currentStake && amount < MIN_INITIAL_STAKE_PLUR) {
      if (this.quiet) {
        throw new Error(`Insufficient deposit! Initial deposit has to be at least ${MIN_INITIAL_STAKE_BZZ} xBZZ!`)
      }

      if (
        !(await this.console.confirm(
          `Insufficient deposit! Initial deposit has to be at least ${MIN_INITIAL_STAKE_BZZ} xBZZ. Do you want to increase the deposit to ${MIN_INITIAL_STAKE_BZZ} xBZZ?`,
        ))
      ) {
        throw new Error(`Insufficient deposit! Initial deposit has to be at least ${MIN_INITIAL_STAKE_BZZ} xBZZ!`)
      }

      amount = MIN_INITIAL_STAKE_PLUR
    }

    if (!this.quiet && !this.yes) {
      this.yes = await this.console.confirm(
        'Depositing stake is irreversible! It can not be withdrawn later on. Do you want to continue?',
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
      await this.bee.depositStake(amount.toString())
      spinner.stop()

      this.console.log('PLUR successfully staked!')
    } catch (e) {
      spinner.stop()
      throw e
    }
  }

  public async run(): Promise<void> {
    super.init()

    if (this.amount) {
      await this.deposit(this.amount)
    }

    const stake = await this.bee.getStake()

    this.console.log(createKeyValue('Staked xBZZ', stake.toDecimalString()))
    this.console.quiet(stake.toDecimalString())
  }
}
