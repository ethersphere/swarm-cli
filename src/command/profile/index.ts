import { GroupCommand } from 'furious-commander'
import { Create } from './create'
import { Disable } from './disable'
import { List } from './list'
import { Remove } from './remove'
import { Rename } from './rename'
import { Set } from './set'
import { Show } from './show'
import { Status } from './status'
import { Switch } from './switch'
import { Unset } from './unset'

export class Profile implements GroupCommand {
  public readonly name = 'profile'

  public readonly description = 'Manage CLI profiles'

  public subCommandClasses = [Create, Disable, List, Remove, Rename, Set, Show, Status, Switch, Unset]
}
