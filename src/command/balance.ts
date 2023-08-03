import { BigNumber } from 'bignumber.js'
import chalk from 'chalk'
import { LeafCommand } from 'furious-commander'
import { toSignificantDigits } from '../utils'
import { createKeyValue } from '../utils/text'
import { RootCommand } from './root-command'
import { ETHConversionRate, PLURConversionRate } from '../utils/conversions'

export class Balance extends RootCommand implements LeafCommand {
  public readonly name = 'balance'

  public readonly alias = 'bal'

  public readonly description = 'Show balance'

  public async run(): Promise<void> {
    await super.init()

    this.console.dim('Looking up balance...')
    const stakeBzz = await this.beeDebug.getStake()
    const { bzz, xDai } = await this.beeDebug.getWalletBalance()
    const { totalBalance, availableBalance } = await this.beeDebug.getChequebookBalance()

    const totalBalanceBZZ = BigNumber(totalBalance).dividedBy(PLURConversionRate)
    const availableBalanceBZZ = BigNumber(availableBalance).dividedBy(PLURConversionRate)
    const walletBZZ = BigNumber(bzz).dividedBy(PLURConversionRate)
    const walletDAI = BigNumber(xDai).dividedBy(ETHConversionRate)
    const stakeBzzBN = BigNumber(stakeBzz).dividedBy(PLURConversionRate)
    this.console.log(chalk.bold('Node wallet'))
    this.console.log(createKeyValue('BZZ', toSignificantDigits(walletBZZ)))
    this.console.log(createKeyValue('DAI', toSignificantDigits(walletDAI)))
    this.console.log(createKeyValue('Staked BZZ', toSignificantDigits(stakeBzzBN)))
    this.console.log('')
    this.console.log(chalk.bold('Chequebook (BZZ)'))
    this.console.log(createKeyValue('Total', toSignificantDigits(totalBalanceBZZ)))
    this.console.log(createKeyValue('Available', toSignificantDigits(availableBalanceBZZ)))
    this.console.quiet(`wallet.bzz ${toSignificantDigits(walletBZZ)}`)
    this.console.quiet(`wallet.dai ${toSignificantDigits(walletDAI)}`)
    this.console.quiet(`wallet.stake ${toSignificantDigits(stakeBzzBN)}`)
    this.console.quiet(`chequebook.total ${toSignificantDigits(totalBalanceBZZ)}`)
    this.console.quiet(`chequebook.available ${toSignificantDigits(availableBalanceBZZ)}`)
  }
}
