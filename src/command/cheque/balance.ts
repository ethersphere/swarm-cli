import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { ChequeCommand } from './cheque-command'
import { BigNumber } from 'bignumber.js'

export class Balance extends ChequeCommand implements LeafCommand {
  public readonly name = 'balance'

  public readonly alias = 'bal'

  public readonly description = 'Show balance'

  public async run(): Promise<void> {
    await super.init()

    this.console.info('Looking up balance...')
    const { totalBalance, availableBalance } = await this.beeDebug.getChequebookBalance()
    const { bzz, xDai } = await this.beeDebug.getWalletBalance()

    const PLURConvertionRate = BigNumber(10).pow(16)
    const ETHConvertionRate = BigNumber(10).pow(18)
    const totalBalanceBZZ = BigNumber(totalBalance).dividedBy(PLURConvertionRate)
    const availableBalanceBZZ = BigNumber(availableBalance).dividedBy(PLURConvertionRate)
    const walletBZZ = BigNumber(bzz).dividedBy(PLURConvertionRate)
    const walletDAI = BigNumber(xDai).dividedBy(ETHConvertionRate)
    this.console.log(createKeyValue('Total', totalBalanceBZZ + ' BZZ'))
    this.console.log(createKeyValue('Available', availableBalanceBZZ + ' BZZ'))
    this.console.log(createKeyValue('Wallet Balance', walletBZZ + ' BZZ'))
    this.console.log(createKeyValue('Wallet Balance', walletDAI + ' DAI'))
    this.console.quiet(totalBalanceBZZ + ' ' + availableBalanceBZZ)
    this.console.quiet(walletBZZ + ' ' + walletDAI)
  }
}
