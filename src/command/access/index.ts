import { GroupCommand } from 'furious-commander'
import { Init } from './init'

export class Access implements GroupCommand {
  public readonly name = 'access'

  public readonly description = 'Share access to your uploaded files/folders'

  public subCommandClasses = [Init]
}
