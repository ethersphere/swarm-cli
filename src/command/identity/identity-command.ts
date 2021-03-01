import { RootCommand } from '../root-command'

export class IdentityCommand extends RootCommand {
  protected printNoIdentitiesError(): void {
    this.console.error("You don't have any identities yet")
    this.console.info(`You can create one with command '${this.appName} identity create'`)
  }
}
