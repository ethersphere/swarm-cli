import { existsSync, readFileSync, writeFileSync } from 'fs'
import PackageJson from '../../package.json'
import { CommandConfig } from '../command/root-command/command-config'
import fetch from 'node-fetch'
import { Dates } from 'cafe-utility'

const LATEST_RELEASE_URL = 'https://api.github.com/repos/ethersphere/swarm-cli/releases/latest'

type VersionCheckData = {
  latestVersion: string
  expiresAt: number
}

export async function checkForUpdates(config: CommandConfig) {
  if (process.env.SKIP_VERSION_CHECK === 'true') {
    return
  }

  const filePath = config.getVersionCheckFilePath()

  try {
    const response = await fetch(LATEST_RELEASE_URL)

    if (!response.ok) {
      return
    }

    const data = (await response.json()) as { tag_name: string }
    const latestVersion = data.tag_name.replace(/^v/, '')
    const versionCheckData = {
      latestVersion,
      expiresAt: Date.now() + Dates.days(1),
    }

    if (latestVersion !== PackageJson.version) {
      writeFileSync(filePath, JSON.stringify(versionCheckData))
    }
  } catch {
    return
  }
}

export function getLatestVersionCheck(config: CommandConfig): VersionCheckData | null {
  const filePath = config.getVersionCheckFilePath()

  if (!existsSync(filePath)) {
    return null
  }

  try {
    const data = JSON.parse(readFileSync(filePath).toString()) as VersionCheckData

    if (Date.now() > data.expiresAt) {
      return null
    }

    return {
      latestVersion: data.latestVersion,
      expiresAt: data.expiresAt,
    }
  } catch {
    return null
  }
}
