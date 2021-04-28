import { Printer } from 'furious-commander/dist/printer'
import { blue, bold } from 'kleur'
import { CommandLog, VerbosityLevel } from './command/root-command/command-log'

export function createPrinter(): Printer {
  const commandLog = new CommandLog(VerbosityLevel.Normal)

  return {
    print: commandLog.log,
    printError: commandLog.error,
    printHeading: (text: string) => commandLog.log(bold(blue('█ ' + text))),
    formatImportant: (text: string) => bold(text),
    getGenericErrorMessage: () => 'Failed to run command!',
  }
}
