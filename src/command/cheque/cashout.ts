import { LeafCommand, Option } from 'furious-commander'
import { bold, green } from 'kleur'
import { ChequeCommand } from './cheque-command'

export class Cashout extends ChequeCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'cashout'

  public readonly aliases = ['co']

  public readonly description = 'Cashout one or all pending cheques'

  @Option({ key: 'peer', alias: 'p', description: 'Peer address', required: true, conflicts: 'all' })
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

  @Option({
    key: 'minimum',
    alias: 'm',
    type: 'bigint',
    minimum: BigInt(0),
    description: 'Cashout cheques with balance above this value in PLUR',
    default: BigInt(0),
  })
  public minimum!: bigint

  @Option({
    key: 'gas-limit',
    type: 'bigint',
    minimum: BigInt(0),
    description: 'Gas limit of each transaction in wei',
  })
  public gasLimit!: bigint

  @Option({
    key: 'gas-price',
    type: 'bigint',
    minimum: BigInt(0),
    description: 'Gas price of each transaction in wei',
  })
  public gasPrice!: bigint

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
      await this.cashoutOne(this.peer, amount)
    }
  }

  private async cashoutAll(): Promise<void> {
    this.console.info(`Collecting cheques with value at least ${this.minimum} PLUR...`)
    const cheques = await this.getFilteredCheques(this.minimum)
    this.console.info('Found ' + cheques.length + ' cheques.')
    for (const { amount, address } of cheques) {
      await this.cashoutOne(address, amount)
    }
  }

  private async cashoutOne(address: string, amount: bigint): Promise<void> {
    try {
      this.console.log(green('Cashing out:'))
      this.printCheque({ address, amount })
      const transaction = await this.beeDebug.cashoutLastCheque(address, {
        gasLimit: this.gasLimit,
        gasPrice: this.gasPrice,
      })
      this.console.log(green(bold('Tx:'.padEnd(14))) + transaction)
      this.console.quiet(transaction)
    } catch (error) {
      this.console.error('Could not cashout ' + address)
      this.console.printBeeError(error, { notFoundMessage: 'No peer found with that address.' })
    }
  }
}
