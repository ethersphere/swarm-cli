import { GroupCommand } from 'furious-commander'
import { Download } from './download'
import { List } from './list'

export class Manifest implements GroupCommand {
  public readonly name = 'manifest'
  public readonly description = 'Operate on manifests'

  public subCommandClasses = [Download, List]
}
