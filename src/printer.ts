import chalk from 'chalk'
import { Printer } from '../vendor/commander'
import { Printer as SwarmPrinter } from './command/root-command/printer'

export const printer: Printer = {
  print: SwarmPrinter.log,
  printError: SwarmPrinter.error,
  printHeading: (text: string) => SwarmPrinter.log(chalk.bold('█ ' + text)),
  formatDim: (text: string) => chalk.dim(text),
  formatImportant: (text: string) => chalk.bold(text),
  getGenericErrorMessage: () => 'Failed to run command!',
}
