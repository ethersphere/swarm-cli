import { promises, statSync } from 'fs'
import { join } from 'path'
import { CommandLog } from '../command/root-command/command-log'
import { CommandLineError } from './error'

export function fileExists(path: string): boolean {
  try {
    const stat = statSync(path)

    return stat.isFile()
  } catch {
    return false
  }
}

export function expectFile(path: string): void {
  if (!fileExists(path)) {
    throw new CommandLineError(`Expected file at path '${path}', found none`)
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
  if (directory.startsWith('./')) {
    directory = directory.slice(2)
  }

  if (!directory.endsWith('/')) {
    directory = directory + '/'
  }

  return path.replace(directory, '')
}

/**
 * Lists all files recursively in a folder, considering cwd for the relative path
 * @param path folder path
 * @param cwd for relative paths
 * @returns an async generator of path strings
 */
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

export function hasField(some: unknown, key: string): boolean {
  return typeof some === 'object' && some !== null && key in some
}

export function getFieldOrNull<T>(some: unknown, key: string): T | null {
  return typeof some === 'object' && some !== null ? Reflect.get(some, key) : null
}

export function readStdin(commandLog: CommandLog): Promise<Buffer> {
  const INTERVAL_SECS = 5

  return new Promise((resolve, reject) => {
    let sizeCounter = 0
    let intervals = 0
    process.stdin.resume()
    const chunks: Buffer[] = []
    const interval = setInterval(() => {
      if (!chunks.length) {
        commandLog.info(`Nothing to read from stdin for ${++intervals * INTERVAL_SECS} seconds...`)
      } else {
        clearInterval(interval)
      }
    }, INTERVAL_SECS * 1000)
    process.stdin.on('data', chunk => {
      sizeCounter += chunk.length

      if (sizeCounter > 1e9) {
        reject('Reading more than 1 gigabyte from stdin is currently not supported')

        return
      }
      chunks.push(chunk)
    })
    process.stdin.on('end', () => {
      clearInterval(interval)
      resolve(Buffer.concat(chunks))
    })
  })
}

export function parseHeaders(headers: string[]): Record<string, string> {
  const object: Record<string, string> = {}
  for (const item of headers) {
    const separatorIndex = item.indexOf(':')

    if (separatorIndex === -1) {
      continue
    }
    const key = item.slice(0, separatorIndex).trim()
    const value = item.slice(separatorIndex + 1).trim()
    object[key] = value
  }

  return object
}

export function normalizePrivateKey(string: string): string {
  let normalized = string.toLowerCase()

  if (normalized.startsWith('0x') && normalized.length === 66) {
    normalized = normalized.slice(2)
  }

  return normalized
}

export function isPrivateKey(string: string): boolean {
  const normalized = normalizePrivateKey(string)

  return /^[a-f0-9]{64}$/.test(normalized)
}
