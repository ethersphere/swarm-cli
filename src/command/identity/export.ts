import { Argument, LeafCommand } from 'furious-commander'
import { Identity, IdentityType } from '../../service/identity/types'
import { RootCommand } from '../root-command'
import { printNoIdentitiesError, promptUserForIdentity } from './common'

export class Export extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'export'

  public readonly description = 'Export identity'

  @Argument({ key: 'identity-name', describe: 'Name of the identity to be exported' })
  public identityName!: string

  public async run(): Promise<void> {
    this.initCommand()

    if (!this.commandConfig.config.identities) {
      printNoIdentitiesError(this)

      return
    }

    const { identities } = this.commandConfig.config

    const v3Names: string[] = Object.entries(identities)
      .filter(identity => identity[1].identityType === IdentityType.v3)
      .map(identity => identity[0])

    if (!this.identityName) {
      if (v3Names.length === 0) {
        this.console.error('You do not have any V3-type identities to choose from')

        return
      }

      this.identityName = await promptUserForIdentity(v3Names, 'Which identity would you like to export?')
    }

    if (!identities[this.identityName]) {
      this.console.error('No such identity')

      return
    }

    const identity: Identity = identities[this.identityName]

    if (identity.identityType !== IdentityType.v3) {
      this.console.error('Only V3-type identities can be exported')

      return
    }

    this.console.log(JSON.stringify(identity.wallet, null, 4))
  }

  /** Init additional properties of class, that are not handled by the CLI framework */
  private initCommand(): void {
    super.init()
  }
}
