import { Argument, LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { pickIdentity } from '../../service/identity'
import { IdentityCommand } from './identity-command'

export class Remove extends IdentityCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'remove'

  public readonly aliases = ['rm']

  public readonly description = 'Remove identity'

  @Argument({ key: 'identity-name', description: 'Name of the designated identity for delete' })
  public identityName!: string

  @Option({ key: 'force', alias: 'f', type: 'boolean', description: 'Perform action without confirm input prompt' })
  public force!: boolean

  public async run(): Promise<void> {
    super.init()

    if (!this.commandConfig.config.identities) {
      this.printNoIdentitiesError()

      return
    }

    if (!this.identityName) {
      this.identityName = await pickIdentity(this.commandConfig, this.console)
    }

    const identityNames = Object.keys(this.commandConfig.config.identities)

    //check identityName does exist
    if (!identityNames.includes(this.identityName)) {
      this.console.error('Given identity name does not exist')

      exit(1)
    }

    if (!this.force) {
      const confirmation = await this.console.confirm(`Are you sure you want delete identity '${this.identityName}'?`)

      if (!confirmation) {
        this.console.error('Removal of identity has been cancelled')

        exit(1)
      }
    }

    this.commandConfig.removeIdentity(this.identityName)
    this.console.log('Identity has been successfully removed')
  }
}
