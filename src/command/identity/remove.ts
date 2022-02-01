import { Argument, LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { IdentityCommand } from './identity-command'

export class Remove extends IdentityCommand implements LeafCommand {
  public readonly name = 'remove'

  public readonly alias = 'rm'

  public readonly description = 'Remove identity'

  @Argument({ key: 'name', description: 'Name of the identity to be deleted' })
  public identityName!: string

  @Option({ key: 'force', alias: 'f', type: 'boolean', description: 'Perform action without confirmation' })
  public force!: boolean

  public async run(): Promise<void> {
    await super.init()
    const { name } = await this.getOrPickIdentity(this.identityName)

    if (!this.force) {
      const confirmation = await this.console.confirmAndDelete(`Are you sure you want delete the identity '${name}'?`)

      if (!confirmation) {
        this.console.log('Aborted')
        exit(0)
      }
    }

    this.commandConfig.removeIdentity(name)
    this.console.log(`Identity '${name}' has been successfully deleted`)
  }
}
