import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { ChequeCommand } from './cheque-command'

export class Balance extends ChequeCommand implements LeafCommand {
  public readonly name = 'balance'

  public readonly alias = 'bal'

  public readonly description = 'Show balance'

  public async run(): Promise<void> {
    await super.init()

    this.console.info('Looking up balance...')
    const balance = await this.beeDebug.getChequebookBalance()
    const bzzConvertionRate = Number(Math.pow(10, 16).toString())
    const totalBalanceBZZ = Number(balance.totalBalance) / bzzConvertionRate
    const availableBalanceBZZ = Number(balance.availableBalance) / bzzConvertionRate
    this.console.log(createKeyValue('Total', totalBalanceBZZ + ' BZZ'))
    this.console.log(createKeyValue('Available', availableBalanceBZZ + ' BZZ'))
    this.console.quiet(balance.totalBalance + ' ' + balance.availableBalance)
  }
}
