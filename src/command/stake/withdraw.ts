import { BZZ } from '@ethersphere/bee-js'
import { LeafCommand } from 'furious-commander'
import { createSpinner } from '../../utils/spinner'
import { RootCommand } from '../root-command'
import { VerbosityLevel } from '../root-command/command-log'

export class Withdraw extends RootCommand implements LeafCommand {
  public readonly name = 'withdraw'

  public readonly description = `Withdraw surplus stake to the node's balance`

  public async run(): Promise<void> {
    super.init()

    const surplusStake = await this.bee.getWithdrawableStake()
    if (surplusStake.eq(BZZ.fromDecimalString('0'))) {
      this.console.log('There is no surplus stake to withdraw.')
      return
    }

    if (!this.quiet && !this.yes) {
      this.yes = await this.console.confirm(
        `You are about to withdraw a surplus stake of ${surplusStake.toDecimalString()} xBZZ, are you sure you wish to proceed?`,
      )
    }

    if (!this.yes && !this.quiet) {
      return
    }

    const spinner = createSpinner('Withdrawing surplus stake')
    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      spinner.start()
    }
    try {
      await this.bee.withdrawSurplusStake()
      spinner.stop()

      this.console.log(
        'Successfully withdrawn surplus stake! It may take a few minutes for the withdrawal to be reflected in the node status.',
      )
    } catch (e) {
      spinner.stop()
      throw e
    }
  }
}
