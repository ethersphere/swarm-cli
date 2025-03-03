import { GroupCommand } from 'furious-commander'
import { Create } from './create'
import { Get } from './get'
import { Patch } from './patch'

export class Grantee implements GroupCommand {
  public readonly name = 'grantee'

  public readonly description = 'Create, Get, Patch grantee list'

  public subCommandClasses = [Create, Get, Patch]
}
