import { BigNumber } from 'bignumber.js'
import chalk from 'chalk'
import { LeafCommand } from 'furious-commander'
import { toSignificantDigits } from '../utils'
import { createKeyValue } from '../utils/text'
import { RootCommand } from './root-command'

export class Balance extends RootCommand implements LeafCommand {
  public readonly name = 'balance'

  public readonly alias = 'bal'

  public readonly description = 'Show balance'

  public async run(): Promise<void> {
    await super.init()

    this.console.dim('Looking up balance...')
    const { bzzBalance, nativeTokenBalance } = await this.beeDebug.getWalletBalance()
    const { totalBalance, availableBalance } = await this.beeDebug.getChequebookBalance()

    const PLURConvertionRate = BigNumber(10).pow(16)
    const ETHConvertionRate = BigNumber(10).pow(18)
    const totalBalanceBZZ = BigNumber(totalBalance).dividedBy(PLURConvertionRate)
    const availableBalanceBZZ = BigNumber(availableBalance).dividedBy(PLURConvertionRate)
    const walletBZZ = BigNumber(bzzBalance).dividedBy(PLURConvertionRate)
    const walletDAI = BigNumber(nativeTokenBalance).dividedBy(ETHConvertionRate)
    this.console.log(chalk.bold('Node wallet'))
    this.console.log(createKeyValue('BZZ', toSignificantDigits(walletBZZ)))
    this.console.log(createKeyValue('DAI', toSignificantDigits(walletDAI)))
    this.console.log('')
    this.console.log(chalk.bold('Chequebook (BZZ)'))
    this.console.log(createKeyValue('Total', toSignificantDigits(totalBalanceBZZ)))
    this.console.log(createKeyValue('Available', toSignificantDigits(availableBalanceBZZ)))
    this.console.quiet(`wallet.bzz ${toSignificantDigits(walletBZZ)}`)
    this.console.quiet(`wallet.dai ${toSignificantDigits(walletDAI)}`)
    this.console.quiet(`chequebook.total ${toSignificantDigits(totalBalanceBZZ)}`)
    this.console.quiet(`chequebook.available ${toSignificantDigits(availableBalanceBZZ)}`)
  }
}
