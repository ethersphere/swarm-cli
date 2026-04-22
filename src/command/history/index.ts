import { GroupCommand } from 'furious-commander'
import { List } from './list'
import { Show } from './show'
import { Enable } from './enable'
import { Disable } from './disable'

export class History implements GroupCommand {
  public readonly name = 'history'

  public readonly description = 'Get upload history'

  public subCommandClasses = [List, Show, Enable, Disable]
}
