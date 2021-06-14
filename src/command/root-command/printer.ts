/* eslint-disable no-console */
import { bold, dim, italic } from 'kleur'

export const Printer = {
  emptyFunction: (): void => {
    return
  },
  divider: (char = '-'): void => {
    console.log(char.repeat(process.stdout.columns))
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(bold().white().bgRed(message), ...args)
  },
  log: (message: string, ...args: unknown[]): void => {
    console.log(message, ...args)
  },
  info: (message: string, ...args: unknown[]): void => {
    console.log(italic().dim(message), ...args)
  },
  dimFunction: (message: string, ...args: unknown[]): void => {
    console.log(dim(message), ...args)
  },
}
