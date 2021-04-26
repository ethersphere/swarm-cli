import { LeafCommand, Option } from 'furious-commander'
import { bold, green } from 'kleur'
import { ChequeCommand } from './cheque-command'

export class Cashout extends ChequeCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'cashout'

  public readonly aliases = ['co']

  public readonly description = 'Cashout one or all pending cheques'

  @Option({ key: 'peer', alias: 'p', type: 'string', description: 'Peer address', required: true, conflicts: 'all' })
  public peer!: string | null

  @Option({
    key: 'all',
    alias: 'a',
    type: 'boolean',
    description: 'Cashout all cheques',
    required: true,
    conflicts: 'peer',
  })
  public all!: boolean

  public async run(): Promise<void> {
    super.init()

    if (!(await this.checkDebugApiHealth())) {
      return
    }

    if (this.all) {
      await this.cashoutAll()
    }

    if (this.peer) {
      const amount = await this.getUncashedAmount(this.peer)
      await this.checkoutOne(this.peer, amount)
    }
  }

  private async cashoutAll(): Promise<void> {
    this.console.info(`Collecting cheques with value at least ${this.minimum}...`)
    const cheques = await this.getFilteredCheques()
    this.console.info('Found ' + cheques.length + ' cheques.')
    for (const { amount, address } of cheques) {
      await this.checkoutOne(address, amount)
    }
  }

  private async checkoutOne(address: string, amount: bigint): Promise<void> {
    try {
      this.console.log(green('Cashing out:'))
      this.printCheque({ address, amount })
      const response = await this.beeDebug.cashoutLastCheque(address)
      this.console.log(green(bold('Tx:'.padEnd(14))) + response.transactionHash)
      this.console.quiet(response.transactionHash)
    } catch (error) {
      if (error.message === 'Not Found') {
        this.console.error('Peer not found')
      } else {
        throw error
      }
    }
  }
}
