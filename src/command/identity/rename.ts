import { Argument, LeafCommand } from 'furious-commander'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { IdentityCommand } from './identity-command'

export class Rename extends IdentityCommand implements LeafCommand {
  public readonly name = 'rename'

  public readonly alias = 'mv'

  public readonly description = 'Rename an existing identity'

  @Argument({ key: 'name', description: 'Name of the identity to be renamed', required: true })
  public identityName!: string

  @Argument({ key: 'new-name', description: 'New name of the identity', required: true })
  public newName!: string

  public async run(): Promise<void> {
    await super.init()
    const identity = this.getIdentityByName(this.identityName)

    if (!this.commandConfig.saveIdentity(this.newName, identity)) {
      throw new CommandLineError(Message.identityNameConflict(this.newName))
    }
    this.commandConfig.removeIdentity(this.identityName)

    this.console.log(`Identity '${this.identityName}' has been renamed to ${this.newName}`)
  }
}
