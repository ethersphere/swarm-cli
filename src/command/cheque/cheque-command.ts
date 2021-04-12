import { Option } from 'furious-commander'
import { bold, dim, italic } from 'kleur'
import { RootCommand } from '../root-command'

interface Cashable {
  address: string
  amount: number
}

export class ChequeCommand extends RootCommand {
  @Option({ key: 'minimum', alias: 'm', type: 'number', describe: 'Filter based on minimum balance', default: 1 })
  public minimum = 1

  protected async checkDebugApiHealth(): Promise<boolean> {
    try {
      this.console.verbose(italic(dim('Checking Debug API health...')))
      const health = await this.beeDebug.getHealth()

      return health.status === 'ok'
    } catch (error) {
      this.console.error('Could not reach Debug API at ' + this.beeDebugApiUrl)
      this.console.error('Make sure you have the Debug API enabled in your Bee config')
      this.console.error('or correct the URL with the --bee-debug-api-url option.')

      return false
    }
  }

  protected async getFilteredCheques(): Promise<Cashable[]> {
    const cheques = await this.getCashableCheques()

    return cheques.filter(({ amount }) => amount >= this.minimum)
  }

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

  protected printCheque(cashable: Cashable): void {
    this.console.divider('-')
    this.console.log(bold('Peer Address: ') + cashable.address)
    this.console.log(bold('Cheque Value: ') + cashable.amount)
    this.console.quiet(cashable.address + ' ' + cashable.amount)
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
