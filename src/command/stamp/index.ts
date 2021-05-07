import { GroupCommand } from 'furious-commander'
import { Buy } from './buy'
import { List } from './list'
import { Show } from './show'
import { Swap } from './swap'

export class Stamp implements GroupCommand {
  public readonly name = 'stamp'

  public readonly description = 'Buy, swap, list and show postage stamps'

  public subCommandClasses = [List, Buy, Show, Swap]
}
