import { GroupCommand } from 'furious-commander'
import { List } from './list'

export class History implements GroupCommand {
  public readonly name = 'history'

  public readonly description = 'Get upload history'

  public subCommandClasses = [List]
}
