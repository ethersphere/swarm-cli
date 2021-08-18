import { Argument, LeafCommand } from 'furious-commander'
import { exit } from 'process'
import { Identity, IdentityType } from '../../service/identity/types'
import { IdentityCommand } from './identity-command'

export class Export extends IdentityCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'export'

  public readonly description = 'Export identity'

  @Argument({ key: 'identity-name', description: 'Name of the identity to be exported' })
  public identityName!: string

  public async run(): Promise<void> {
    super.init()
    this.checkForNoIdentities()
    const identities = this.getV3Identities()
    this.checkForEmptyIdentities(identities)
    await this.ensureIdentityNameIsProvided(identities)
    this.checkForExistingIdentity()
    const identity: Identity = this.commandConfig.config.identities[this.identityName]
    this.checkForV3Identity(identity)
    this.console.log(JSON.stringify(identity.wallet, null, 4))
  }

  private getV3Identities(): string[] {
    return Object.entries(this.commandConfig.config.identities)
      .filter(identity => identity[1].identityType === IdentityType.v3)
      .map(identity => identity[0])
  }

  private async ensureIdentityNameIsProvided(identities: string[]): Promise<void> {
    if (!this.identityName) {
      this.identityName = await this.console.promptList(identities, 'Which identity would you like to export?')
    }
  }

  private checkForExistingIdentity(): void {
    if (!this.commandConfig.config.identities[this.identityName]) {
      this.console.error('No such identity')

      exit(1)
    }
  }

  private checkForEmptyIdentities(identities: string[]): void {
    if (identities.length === 0) {
      this.console.error('You do not have any V3-type identities to choose from')

      exit(1)
    }
  }

  private checkForNoIdentities(): void {
    if (!this.commandConfig.config.identities) {
      this.printNoIdentitiesError()

      exit(1)
    }
  }

  private checkForV3Identity(identity: Identity): void {
    if (identity.identityType !== IdentityType.v3) {
      this.console.error('Only V3-type identities can be exported')

      exit(1)
    }
  }
}
