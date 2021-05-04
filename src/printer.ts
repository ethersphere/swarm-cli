import { Printer } from 'furious-commander/dist/printer'
import { bold, dim } from 'kleur'
import { CommandLog, VerbosityLevel } from './command/root-command/command-log'

const commandLog = new CommandLog(VerbosityLevel.Normal)

export const printer: Printer = {
  print: commandLog.log,
  printError: commandLog.error,
  printHeading: (text: string) => commandLog.log(bold('█ ' + text)),
  formatDim: (text: string) => dim(text),
  formatImportant: (text: string) => bold(text),
  getGenericErrorMessage: () => 'Failed to run command!',
}
