import { BigNumber } from 'bignumber.js'
import { LeafCommand, Option } from 'furious-commander'
import { toSignificantDigits } from '../utils'
import { createKeyValue } from '../utils/text'
import { RootCommand } from './root-command'
import { createSpinner } from '../utils/spinner'
import { VerbosityLevel } from './root-command/command-log'
import { PLURConversionRate } from '../utils/conversions'

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
    const currentStake = BigInt(await this.beeDebug.getStake())

    if (!currentStake && amount < MIN_INITIAL_STAKE_PLUR) {
      if (this.quiet) {
        throw new Error(`Insufficient deposit! Initial deposit has to be at least ${MIN_INITIAL_STAKE_BZZ} BZZ!`)
      }

      if (
        !(await this.console.confirm(
          `Insufficient deposit! Initial deposit has to be at least ${MIN_INITIAL_STAKE_BZZ} BZZ. Do you want to increase the deposit to ${MIN_INITIAL_STAKE_BZZ} BZZ?`,
        ))
      ) {
        throw new Error(`Insufficient deposit! Initial deposit has to be at least ${MIN_INITIAL_STAKE_BZZ} BZZ!`)
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
      await this.beeDebug.depositStake(amount.toString())
      spinner.stop()

      this.console.log('PLUR successfully staked!')
    } catch (e) {
      spinner.stop()
      throw e
    }
  }

  public async run(): Promise<void> {
    await super.init()

    if (this.amount) {
      await this.deposit(this.amount)
    }

    const stake = await this.beeDebug.getStake()
    const stakeBN = BigNumber(stake).dividedBy(PLURConversionRate)

    this.console.log(createKeyValue('Staked BZZ', toSignificantDigits(stakeBN)))
    this.console.quiet(toSignificantDigits(stakeBN))
  }
}
