import { LeafCommand } from 'furious-commander'
import { ChequeCommand } from './cheque-command'

export class List extends ChequeCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'list'

  public readonly aliases = ['l', 'ls']

  public readonly description = 'List cashable cheques'

  public async run(): Promise<void> {
    super.init()
    this.console.info(`Looking up cheques with value at least ${this.minimum}...`)
    const cheques = await this.getFilteredCheques()

    if (!cheques.length) {
      this.console.log('No uncashed cheques found.')
    }
    for (const { amount, address } of cheques) {
      this.console.log(address + ' - ' + amount)
      this.console.quiet(address + ' - ' + amount)
    }
  }
}
