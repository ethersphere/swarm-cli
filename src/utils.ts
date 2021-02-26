import { statSync } from 'fs'
import inquirer from 'inquirer'

/**
 * Sleep for N miliseconds
 *
 * @param ms Number of miliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(() => resolve(), ms))
}

export function fileExists(path: string): boolean {
  try {
    const stat = statSync(path)

    return stat.isFile()
  } catch {
    return false
  }
}

export async function promptList(choices: string[], message: string): Promise<string> {
  const result = await inquirer.prompt({ name: 'value', type: 'list', message, choices })

  return result.value
}
