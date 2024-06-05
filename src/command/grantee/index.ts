import { GroupCommand } from 'furious-commander'
import { Add } from './add'
import { Get } from './get'
import { Patch } from './patch'

export class Grantee implements GroupCommand {
  public readonly name = 'grantee'

  public readonly description = 'Add, Get, Patch grantee list'

  public subCommandClasses = [Add, Get, Patch]
}
