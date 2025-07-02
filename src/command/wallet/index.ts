import { GroupCommand } from 'furious-commander'
import { Status } from './status'
import { WithdrawBZZ } from './withdraw-bzz'
import { WithdrawDAI } from './withdraw-dai'

export class Wallet implements GroupCommand {
  public readonly name = 'wallet'

  public readonly description = 'Manages node wallet'

  public subCommandClasses = [Status, WithdrawBZZ, WithdrawDAI]
}
