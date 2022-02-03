import { GroupCommand } from 'furious-commander'
import { Create } from './create'
import { Export } from './export'
import { Import } from './import'
import { List } from './list'
import { Remove } from './remove'
import { Rename } from './rename'
import { Show } from './show'

export class Identity implements GroupCommand {
  public readonly name = 'identity'

  public readonly description = 'Import, export and manage keypairs, identities'

  public subCommandClasses = [Create, Export, Import, List, Remove, Rename, Show]
}
