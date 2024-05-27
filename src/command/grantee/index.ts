import { GroupCommand } from 'furious-commander'
import { Add } from './add'
import { Get } from './get'

export class Grantee implements GroupCommand {
  public readonly name = 'grantee'

  public readonly description = 'Add, Get grantee list'

  public subCommandClasses = [Add, Get]
}
