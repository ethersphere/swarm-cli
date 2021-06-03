import { GroupCommand } from 'furious-commander'
import { Receive } from './receive'
import { Send } from './send'
import { Subscribe } from './subscribe'

export class Pss implements GroupCommand {
  public readonly name = 'pss'

  public readonly description = 'Send, receive, or subscribe to PSS messages'

  public subCommandClasses = [Send, Receive, Subscribe]
}
