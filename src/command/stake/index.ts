import { GroupCommand } from 'furious-commander'
import { Deposit } from './deposit'
import { Recover } from './recover'
import { Status } from './status'
import { Withdraw } from './withdraw'

export class Stake implements GroupCommand {
  public readonly name = 'stake'

  public readonly description = 'Manages node stake'

  public subCommandClasses = [Status, Deposit, Withdraw, Recover]
}
