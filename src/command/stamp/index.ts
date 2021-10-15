import { GroupCommand } from 'furious-commander'
import { Buy } from './buy'
import { Dilute } from './dilute'
import { List } from './list'
import { Show } from './show'
import { Topup } from './topup'

export class Stamp implements GroupCommand {
  public readonly name = 'stamp'

  public readonly description = 'Buy, list and show postage stamps'

  public subCommandClasses = [List, Buy, Show, Dilute, Topup]
}
