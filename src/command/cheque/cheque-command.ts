import { BZZ } from '@ethersphere/bee-js'
import { getFieldOrNull } from '../../utils'
import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'

interface Cashable {
  address: string
  amount: BZZ
}

export class ChequeCommand extends RootCommand {
  protected async getFilteredCheques(minimum: bigint): Promise<Cashable[]> {
    const cheques = await this.getCashableCheques()

    return cheques.filter(({ amount }) => amount.toPLURBigInt() >= minimum)
  }

  protected async getCashableCheques(): Promise<Cashable[]> {
    const { lastcheques } = await this.bee.getLastCheques()

    const results: Cashable[] = []
    for (const cheque of lastcheques) {
      if (cheque.lastreceived === null) {
        continue
      }
      const uncashedAmount = await this.getUncashedAmount(cheque.peer)
      results.push({
        address: cheque.peer,
        amount: uncashedAmount,
      })
    }

    return results
  }

  protected printCheque(cashable: Cashable): void {
    this.console.divider('-')
    this.console.log(createKeyValue('Peer Address', cashable.address))
    this.console.log(createKeyValue('Cheque Value', cashable.amount.toDecimalString() + ' xBZZ'))
    this.console.quiet(cashable.address + ' ' + cashable.amount)
  }

  protected async getUncashedAmount(address: string): Promise<BZZ> {
    try {
      const lastCashout = await this.bee.getLastCashoutAction(address)

      return lastCashout.uncashedAmount
    } catch (error) {
      if (getFieldOrNull(error, 'message') === 'Not Found') {
        return BZZ.fromPLUR('0')
      }
      throw error
    }
  }
}
