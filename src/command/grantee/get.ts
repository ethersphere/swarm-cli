import { Argument, LeafCommand } from 'furious-commander'
import { GranteeCommand } from './grantee-command'
import { createKeyValue } from '../../utils/text'

export class Get extends GranteeCommand implements LeafCommand {
  public readonly name = 'get'
  public readonly description = 'Get grantee list'

  @Argument({
    key: 'reference',
    description: 'Grantee list reference',
    required: true,
    conflicts: 'stdin',
  })
  public reference!: string

  public async run(): Promise<void> {
    await super.init()
    const response = await this.bee.getGrantees(this.reference)
    this.console.log(
      createKeyValue('Grantee public keys', response.grantees.map(grantee => grantee.toCompressedHex()).join('\n')),
    )
  }
}
