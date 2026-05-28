import { GroupCommand } from 'furious-commander'
import { Grant } from './grant'
import { Init } from './init'
import { List } from './list'
import { Revoke } from './revoke'

export class Access implements GroupCommand {
  public readonly name = 'access'

  public readonly description = 'Share access to your uploaded files/folders'

  public subCommandClasses = [Init, Grant, Revoke, List]
}
