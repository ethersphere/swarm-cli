import { existsSync, mkdirSync } from 'fs'
import { homedir, platform } from 'os'
import { join } from 'path'

export function getConfigFolderPath(appName: string): string {
  const homePath = homedir()

  if (platform() === 'win32') {
    return join(homePath, 'AppData', appName)
  } else {
    return join(homePath, `.${appName}`)
  }
}

export function ensureConfigFolderExists(appName: string): void {
  const path = getConfigFolderPath(appName)

  if (!existsSync(path)) {
    mkdirSync(path, { mode: 0o700, recursive: true })
  }
}
