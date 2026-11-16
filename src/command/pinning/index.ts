import { GroupCommand } from '../../../vendor/commander'
import { List } from './list'
import { Pin } from './pin'
import { ReuploadAll } from './reupload-all'
import { Unpin } from './unpin'

export class Pinning implements GroupCommand {
  public readonly name = 'pinning'

  public readonly description = 'Pin, unpin and check pinned chunks'

  public subCommandClasses = [Pin, Unpin, List, ReuploadAll]
}
