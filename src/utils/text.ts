import { bold, green } from 'kleur'

export function createKeyValue(key: string, value: string | number | boolean, padLength?: number): string {
  return `${green(bold(key + ':')).padEnd(padLength ? padLength + 1 : 0)} ${bold(String(value))}`
}
