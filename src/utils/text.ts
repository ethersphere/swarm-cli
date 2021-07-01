import { bold, green } from 'kleur'

function goUpOneRow(): string {
  return '\u001b[1A'
}

function deleteWholeRow(): string {
  return '\u001b[2K'
}

export function deletePreviousLine(): void {
  process.stdout.write('\r' + goUpOneRow() + deleteWholeRow())
}

export function createKeyValue(key: string, value: string | number | boolean, padLength?: number): string {
  return `${green(bold(key + ':')).padEnd(padLength ? padLength + 1 : 0)} ${bold(String(value))}`
}
