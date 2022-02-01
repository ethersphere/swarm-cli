import { GroupCommand } from 'furious-commander'
import { Create } from './create'
import { Export } from './export'
import { Import } from './import'
import { List } from './list'
import { Remove } from './remove'

export class Identity implements GroupCommand {
  public readonly name = 'identity'

  public readonly description = 'Import, export and manage keypairs, identities'

  public subCommandClasses = [Create, List, Remove, Import, Export]
}
