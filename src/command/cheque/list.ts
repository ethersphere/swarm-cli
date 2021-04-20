import { LeafCommand } from 'furious-commander'
import { ChequeCommand } from './cheque-command'

export class List extends ChequeCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'list'

  public readonly aliases = ['ls']

  public readonly description = 'List cashable cheques'

  public async run(): Promise<void> {
    super.init()

    if (!(await this.checkDebugApiHealth())) {
      return
    }

    this.console.info(`Looking up cheques with value at least ${this.minimum}...`)
    const cheques = await this.getFilteredCheques()

    if (!cheques.length) {
      this.console.log('No uncashed cheques found.')
    }
    cheques.forEach(cheque => this.printCheque(cheque))
  }
}
