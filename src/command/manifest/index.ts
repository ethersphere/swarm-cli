import { GroupCommand } from 'furious-commander'
import { Add } from './add'
import { Create } from './create'
import { Download } from './download'
import { List } from './list'
import { Merge } from './merge'
import { Remove } from './remove'
import { Sync } from './sync'

export class Manifest implements GroupCommand {
  public readonly name = 'manifest'
  public readonly description = 'Operate on manifests'

  public subCommandClasses = [Add, Create, Download, List, Merge, Remove, Sync]
}
