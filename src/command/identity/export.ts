import { Argument, LeafCommand } from 'furious-commander'
import { isSimpleWallet } from '../../service/identity'
import { IdentityType } from '../../service/identity/types'
import { CommandLineError } from '../../utils/error'
import { IdentityCommand } from './identity-command'

export class Export extends IdentityCommand implements LeafCommand {
  public readonly name = 'export'

  public readonly description = 'Export identity'

  @Argument({ key: 'name', description: 'Name of the identity to be exported' })
  public identityName!: string

  public async run(): Promise<void> {
    await super.init()
    const { identity } = await this.getOrPickIdentity(this.identityName)

    if (identity.identityType === IdentityType.v3) {
      this.console.log(JSON.stringify(identity.wallet, null, 4))
    } else if (isSimpleWallet(identity.wallet, identity.identityType)) {
      this.console.log(identity.wallet.privateKey)
    } else {
      throw new CommandLineError('Unsupported identity type')
    }
  }
}
