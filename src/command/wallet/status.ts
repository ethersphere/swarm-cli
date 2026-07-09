import chalk from 'chalk'
import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'

export class Status extends RootCommand implements LeafCommand {
  public readonly name = 'status'

  public readonly description = `Prints node wallet balance`

  public async run(): Promise<void> {
    super.init()

    const { bzzBalance, nativeTokenBalance } = await this.bee.getWalletBalance()

    this.console.all(chalk.bold('Wallet'))
    this.console.all(createKeyValue('xBZZ', bzzBalance.toDecimalString()))
    this.console.all(createKeyValue('xDAI', nativeTokenBalance.toDecimalString()))
  }
}
