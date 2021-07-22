import chalk from 'chalk'
import { CommandLog } from '../command/root-command/command-log'

export const orange = chalk.rgb(208, 117, 43)

function goUpOneRow(): string {
  return '\u001b[1A'
}

function deleteWholeRow(): string {
  return '\u001b[2K'
}

export function deletePreviousLine(): void {
  process.stdout.write('\r' + goUpOneRow() + deleteWholeRow())
}

export function createPositiveKeyValue(key: string, value: string | number | boolean, padLength?: number): string {
  return `${chalk.green.bold(key + ':').padEnd(padLength ? padLength + 1 : 0)} ${String(value)}`
}

export function createKeyValue(key: string, value: string | number | boolean, padLength?: number): string {
  return `${orange.bold(key + ':').padEnd(padLength ? padLength + 1 : 0)} ${String(value)}`
}

export function printDivided<T>(
  items: T[],
  printFn: (item: T, console: CommandLog) => void,
  console: CommandLog,
): void {
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    printFn(item, console)

    if (i !== items.length - 1) {
      console.divider()
    }
  }
}
