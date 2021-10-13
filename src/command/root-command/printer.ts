/* eslint-disable no-console */
import chalk from 'chalk'

export const FORMATTED_ERROR = chalk.red.bold('ERROR')

export const Printer = {
  emptyFunction: (): void => {
    return
  },
  divider: (char = '-'): void => {
    console.log(char.repeat(process.stdout.columns))
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(message, ...args)
  },
  log: (message: string, ...args: unknown[]): void => {
    console.log(message, ...args)
  },
  info: (message: string, ...args: unknown[]): void => {
    console.log(chalk.dim(message), ...args)
  },
  dimFunction: (message: string, ...args: unknown[]): void => {
    console.log(chalk.dim(message), ...args)
  },
}
