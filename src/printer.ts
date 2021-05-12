import { Printer } from 'furious-commander/dist/printer'
import { bold, dim } from 'kleur'
import { Printer as SwarmPrinter } from './command/root-command/printer'

export const printer: Printer = {
  print: SwarmPrinter.log,
  printError: SwarmPrinter.error,
  printHeading: (text: string) => SwarmPrinter.log(bold('█ ' + text)),
  formatDim: (text: string) => dim(text),
  formatImportant: (text: string) => bold(text),
  getGenericErrorMessage: () => 'Failed to run command!',
}
