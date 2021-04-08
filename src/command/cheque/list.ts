import { LeafCommand } from 'furious-commander'
import { ChequeCommand } from './cheque-command'

export class List extends ChequeCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'list'

  public readonly aliases = ['l', 'ls']

  public readonly description = 'List pending cheques'

  public async run(): Promise<void> {
    super.init()
    this.console.verbose('Looking up cheques...')
    const cheques = await this.getCashableCheques()

    if (!cheques.length) {
      this.console.log('No cheques found.')
    }
    for (const { amount, address } of cheques) {
      if (amount === 0) {
        this.console.verbose(address + ' - ' + amount)
        continue
      }
      this.console.log(address + ' - ' + amount)
      this.console.quiet(address + ' - ' + amount)
    }
  }
}
