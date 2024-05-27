import { Argument, LeafCommand } from 'furious-commander'
import { GranteeCommand } from './grantee-command'

export class Get extends GranteeCommand implements LeafCommand {
  public readonly name = 'get'
  public readonly description = 'Get grantee list'

  @Argument({
    key: 'path',
    description: 'Path to the file with grantee list',
    required: true,
    autocompletePath: true,
    conflicts: 'stdin',
  })
  public path!: string

  public async run(): Promise<void> {
    await super.init()
  }
}
