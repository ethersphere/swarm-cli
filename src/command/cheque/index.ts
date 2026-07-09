import { GroupCommand } from 'furious-commander'
import { Cashout } from './cashout'
import { Deposit } from './deposit'
import { List } from './list'
import { Withdraw } from './withdraw'
import { WithdrawAll } from './withdraw-all'

export class Cheque implements GroupCommand {
  public readonly name = 'cheque'

  public readonly description = 'Deposit, withdraw and manage cheques'

  public subCommandClasses = [List, Cashout, Deposit, Withdraw, WithdrawAll]
}
