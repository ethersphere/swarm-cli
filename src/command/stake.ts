import { BigNumber } from 'bignumber.js'
import { LeafCommand, Option } from 'furious-commander'
import { toSignificantDigits } from '../utils'
import { createKeyValue } from '../utils/text'
import { RootCommand } from './root-command'
import { createSpinner } from '../utils/spinner'
import { VerbosityLevel } from './root-command/command-log'
import { PLURConversionRate } from '../utils/conversions'

export class Stake extends RootCommand implements LeafCommand {
  public readonly name = 'stake'

  public readonly description = `Manages nodes stake
  
When depositing initial stake, it has to be 10 BZZ (which can be entered as "100_000T").
Be aware, depositing stake is irreversible! It can not be withdrawn later on.`

  @Option({
    key: 'deposit',
    description: "Amount of PLUR to add to the node's stake",
    type: 'bigint',
    minimum: BigInt(1),
  })
  public amount!: bigint | undefined

  public async run(): Promise<void> {
    await super.init()

    if (this.amount) {
      const spinner = createSpinner('Depositing stake')

      if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
        spinner.start()
      }

      try {
        await this.beeDebug.depositStake(this.amount.toString())
        spinner.stop()

        this.console.log('PLUR successfully staked!')
      } catch (e) {
        spinner.stop()
        throw e
      }
    }

    const stake = await this.beeDebug.getStake()
    const stakeBN = BigNumber(stake).dividedBy(PLURConversionRate)

    this.console.log(createKeyValue('Staked BZZ', toSignificantDigits(stakeBN)))
    this.console.quiet(toSignificantDigits(stakeBN))
  }
}
