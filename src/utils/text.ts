import chalk from 'chalk'
import { CommandLog } from '../command/root-command/command-log'

function goUpOneRow(): string {
  return '\u001b[1A'
}

function deleteWholeRow(): string {
  return '\u001b[2K'
}

export function warningSymbol(): string {
  return chalk.yellow.bold('⚠️  Warning!')
}

export function warningText(string: string): string {
  return chalk.yellow(string)
}

export function deletePreviousLine(): void {
  process.stdout.write('\r' + goUpOneRow() + deleteWholeRow())
}

export function createKeyValue(key: string, value: string | number | boolean, padLength?: number): string {
  return `${chalk.green.bold(key + ':').padEnd(padLength ? padLength + 1 : 0)} ${String(value)}`
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
