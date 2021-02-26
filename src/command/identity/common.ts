import { RootCommand } from '../root-command'

export const printNoIdentitiesError = (command: RootCommand): void => {
  command.console.error("You don't have any identities yet")
  command.console.info(`You can create one with command '${command.appName} identity create'`)
}
