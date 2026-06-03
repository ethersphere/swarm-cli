import { GroupCommand } from 'furious-commander'
import { Grant } from './grant'
import { History } from './history'
import { Init } from './init'
import { Revoke } from './revoke'
import { Show } from './show'

export class Access implements GroupCommand {
  public readonly name = 'access'

  public readonly description = 'Share access to your uploaded files/folders'

  public subCommandClasses = [Init, Grant, Revoke, Show, History]
}
