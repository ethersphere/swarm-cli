import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'

export class Status extends RootCommand implements LeafCommand {
  public readonly name = 'status'

  public readonly description = `Prints staked and withdrawable stake`

  public async run(): Promise<void> {
    super.init()

    const stake = await this.bee.getStake()
    const surplusStake = await this.bee.getWithdrawableStake()

    this.console.log(createKeyValue('Staked xBZZ', stake.toDecimalString()))
    this.console.log(createKeyValue('Withdrawable staked xBZZ', surplusStake.toDecimalString()))
    this.console.quiet(stake.toDecimalString())
  }
}
