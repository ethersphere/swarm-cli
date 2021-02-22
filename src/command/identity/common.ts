import inquirer from 'inquirer'
import { RootCommand } from '../root-command'

export const printNoIdentitiesError = (command: RootCommand): void => {
  command.console.error("You don't have any identities yet")
  command.console.info(`You can create one with command '${command.appName} identity create'`)
}

export const promptUserForIdentity = async (choices: string[], message: string): Promise<string> => {
  const result = await inquirer.prompt({
    message: message,
    name: 'identityName',
    choices,
    type: 'list',
  })

  return result.identityName
}
