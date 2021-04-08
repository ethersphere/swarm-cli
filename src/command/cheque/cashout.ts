import { LeafCommand, Option } from 'furious-commander'
import { ChequeCommand } from './cheque-command'

export class Cashout extends ChequeCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'cashout'

  public readonly description = 'Cashout one or all pending cheques'

  @Option({ key: 'peer', alias: 'p', type: 'string', describe: 'Peer address', default: null })
  public peer!: string | null

  @Option({ key: 'all', alias: 'a', type: 'boolean', describe: 'Cashout all cheques', default: false })
  public all!: boolean

  public async run(): Promise<void> {
    super.init()

    if (this.all) {
      this.console.info(`Cashing out all cheques with value at least ${this.minimum}...`)
      const cheques = await this.getFilteredCheques()
      this.console.info('Cashing out ' + cheques.length + ' cheques.')
      for (const { amount, address } of cheques) {
        await this.checkoutOne(address, amount)
      }
    } else if (this.peer) {
      await this.checkoutOne(this.peer, 'N/A')
    } else {
      this.console.error('Either specify --all or a --peer')
    }
  }

  private async checkoutOne(address: string, amount: number | 'N/A'): Promise<void> {
    try {
      this.console.info('Cashing out: ' + address + ' - ' + amount)
      this.console.quiet('Cashing out: ' + address + ' - ' + amount)
      const response = await this.beeDebug.cashoutLastCheque(address)
      this.console.info('Tx: ' + response.transactionHash)
      this.console.quiet('Tx: ' + response.transactionHash)
    } catch (error) {
      if (error.message === 'Not Found') {
        this.console.error('Peer not found')
      } else {
        throw error
      }
    }
  }
}
