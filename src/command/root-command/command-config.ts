import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { homedir, platform } from 'os'
import { join } from 'path'
import { exit } from 'process'
import { beeApiUrl, beeDebugApiUrl } from '../../config'
import { Identity } from '../../service/identity/types'
import { CommandLog } from './command-log'

export interface Config {
  beeApiUrl: string

  beeDebugApiUrl: string

  identities: { [name: string]: Identity }
}

export class CommandConfig {
  public config: Config

  public configFilePath: string

  public configFolderPath: string

  public console: CommandLog

  constructor(appName: string, console: CommandLog, configFolder?: string) {
    this.console = console
    this.config = {
      beeApiUrl: beeApiUrl.default || '',
      beeDebugApiUrl: beeDebugApiUrl.default || '',
      identities: {},
    }
    this.configFolderPath = this.getConfigFolderPath(appName, configFolder)
    this.configFilePath = join(this.configFolderPath, process.env.SWARM_CLI_CONFIG_FILE || 'config.json')
    this.prepareConfig()
  }

  public saveIdentity(name: string, identity: Identity): boolean {
    if (this.config.identities?.[name]) return false

    this.config.identities[name] = identity

    this.saveConfig()

    return true
  }

  public removeIdentity(name: string): void {
    delete this.config.identities?.[name]
    this.saveConfig()
  }

  /** Save configuration object to the CLI's config file */
  private saveConfig() {
    writeFileSync(this.configFilePath, JSON.stringify(this.config), { mode: 0o600 })
  }

  /** Load configuration from config path or creates config folder */
  private prepareConfig() {
    if (!existsSync(this.configFilePath)) {
      if (!existsSync(this.configFolderPath)) mkdirSync(this.configFolderPath, { mode: 0o700, recursive: true })

      //save config initialized in constructor
      this.saveConfig()
    } else {
      //load config
      const configData = readFileSync(this.configFilePath)
      try {
        this.config = JSON.parse(configData.toString())
      } catch (err) {
        this.console.error(
          `There has been an error parsing JSON configuration of CLI from path: '${this.configFilePath}'`,
        )

        exit(1)
      }
    }
  }

  private getConfigFolderPath(appName: string, configFolder?: string): string {
    if (configFolder) return configFolder

    const homePath = homedir()

    if (platform() === 'win32') {
      return join(homePath, 'AppData', appName)
    } else {
      return join(homePath, `.${appName}`)
    }
  }
}
