import { GroupCommand } from 'furious-commander'
import { Buy } from './buy'
import { List } from './list'
import { Show } from './show'

export class Stamp implements GroupCommand {
  public readonly name = 'stamp'

  public readonly description = 'Buy, list and show postage stamps'

  public subCommandClasses = [List, Buy, Show]
}
