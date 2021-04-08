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

  @Option({ key: 'minimum', alias: 'm', type: 'number', describe: 'Minimum balance to cashout', default: 0 })
  public minimum!: number

  public async run(): Promise<void> {
    super.init()

    if (this.all) {
      const cheques = await this.getCashableCheques()
      for (const { amount, address } of cheques) {
        if (amount === 0 || (this.minimum && amount < this.minimum)) {
          this.console.verbose('Skipping: ' + address + ' - ' + amount)
          continue
        }
        await this.checkoutOne(address, amount)
      }
    } else if (this.peer) {
      await this.checkoutOne(this.peer, 'N/A')
    } else {
      this.console.error('Either specify --all or a --peer')
    }
  }

  private async checkoutOne(address: string, amount: number | 'N/A'): Promise<void> {
    this.console.info('Cashing out: ' + address + ' - ' + amount)
    this.console.quiet('Cashing out: ' + address + ' - ' + amount)
    const response = await this.beeDebug.cashoutLastCheque(address)
    this.console.info('Tx: ' + response.transactionHash)
    this.console.quiet('Tx: ' + response.transactionHash)
  }
}
