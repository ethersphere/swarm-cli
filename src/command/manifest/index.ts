import { GroupCommand } from 'furious-commander'
import { Add } from './add'
import { Create } from './create'
import { List } from './list'
import { Merge } from './merge'
import { Remove } from './remove'
import { Sync } from './sync'

export class Manifest implements GroupCommand {
  public readonly name = 'manifest'
  public readonly description = 'Operate on manifests'

  public subCommandClasses = [Add, List, Create, Merge, Sync, Remove]
}
