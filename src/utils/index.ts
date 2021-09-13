import { promises, statSync } from 'fs'
import { join } from 'path'

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

export function directoryExists(path: string): boolean {
  try {
    const stat = statSync(path)

    return !stat.isFile()
  } catch {
    return false
  }
}

export function isGateway(url: string): boolean {
  return url.includes('gateway.ethswarm.org')
}

export function getByteSize(data: string | Uint8Array): number {
  if (data instanceof Uint8Array) {
    return data.byteLength
  }

  return Buffer.byteLength(data, 'utf-8')
}

/**
 * Lists all files recursively in a folder
 * @param path folder path
 * @returns an async generator of path strings
 */
async function* walkTreeAsync(path: string): AsyncGenerator<string> {
  for await (const entry of await promises.opendir(path)) {
    const entryPath = join(path, entry.name)

    if (entry.isDirectory()) {
      yield* walkTreeAsync(entryPath)
    } else if (entry.isFile()) {
      yield entryPath
    }
  }
}

function removeLeadingDirectory(path: string, directory: string) {
  directory = directory.startsWith('./') ? directory.slice(2) : directory
  directory = directory.endsWith('/') ? directory : directory + '/'

  return path.replace(directory, '')
}

export async function readdirDeepAsync(path: string, cwd?: string): Promise<string[]> {
  const entries = []
  for await (const entry of walkTreeAsync(path)) {
    entries.push(cwd ? removeLeadingDirectory(entry, cwd) : entry)
  }

  return entries
}

export async function getFiles(path: string): Promise<string[]> {
  const stat = statSync(path)

  if (stat.isDirectory()) {
    return await readdirDeepAsync(path, path)
  } else {
    return [path]
  }
}
