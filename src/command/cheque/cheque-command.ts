import { RootCommand } from '../root-command'

interface Cashable {
  address: string
  amount: number
}

export class ChequeCommand extends RootCommand {
  protected async getCashableCheques(): Promise<Cashable[]> {
    const { lastcheques } = await this.beeDebug.getLastCheques()

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

  private async getUncashedAmount(address: string): Promise<number> {
    const cumulativePayout = await this.getCumulativePayout(address)
    const lastCashedPayout = await this.getLastCashedPayout(address)

    return cumulativePayout - lastCashedPayout
  }

  private async getCumulativePayout(address: string): Promise<number> {
    const lastCheques = await this.beeDebug.getLastChequesForPeer(address)

    return lastCheques.lastreceived.payout
  }

  private async getLastCashedPayout(address: string): Promise<number> {
    try {
      const lastCashout = await this.beeDebug.getLastCashoutAction(address)

      return lastCashout.cumulativePayout
    } catch (error) {
      if (error.message === 'Not Found') {
        return 0
      }
      throw error
    }
  }
}
