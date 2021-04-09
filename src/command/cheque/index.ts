import { GroupCommand } from 'furious-commander'
import { Balance } from './balance'
import { Cashout } from './cashout'
import { List } from './list'

export class Cheque implements GroupCommand {
  public readonly name = 'cheque'

  public readonly description = 'Cheque'

  public subCommandClasses = [List, Cashout, Balance]
}
