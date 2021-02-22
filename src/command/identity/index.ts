import { GroupCommand } from 'furious-commander'
import { Create } from './create'
import { Export } from './export'
import { List } from './list'
import { Remove } from './remove'

export class Identity implements GroupCommand {
  public readonly name = 'identity'

  public readonly description = 'Keypair management interface'

  public subCommandClasses = [Create, List, Remove, Export]
}
