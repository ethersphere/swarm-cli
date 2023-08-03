import { Bee, BeeDebug, BeeOptions } from '@ethersphere/bee-js'
import { ExternalOption, Sourcemap, Utils } from 'furious-commander'
import { exit } from 'process'
import { printCurlCommand } from '../../curl'
import { parseHeaders } from '../../utils'
import { ConfigOption } from '../../utils/types/config-option'
import { CONFIG_OPTIONS, CommandConfig } from './command-config'
import { CommandLog, VerbosityLevel } from './command-log'

export class RootCommand {
  @ExternalOption('bee-api-url')
  public beeApiUrl!: string

  @ExternalOption('bee-debug-api-url')
  public beeDebugApiUrl!: string

  @ExternalOption('config-folder')
  public configFolder!: string

  @ExternalOption('config-file')
  public configFile!: string

  @ExternalOption('verbosity')
  public verbosity!: VerbosityLevel

  @ExternalOption('verbose')
  public verbose!: boolean

  @ExternalOption('quiet')
  public quiet!: boolean

  @ExternalOption('curl')
  public curl!: boolean

  @ExternalOption('header')
  public header!: string[]

  @ExternalOption('yes')
  public yes!: boolean

  public bee!: Bee
  public _beeDebug!: BeeDebug
  public console!: CommandLog
  public readonly appName = 'swarm-cli'
  public commandConfig!: CommandConfig
  private sourcemap!: Sourcemap
  /**
   * Store Debug API errors here. It cannot be determined beforehand if Debug API is going to be used,
   * since it is optional for some commands. The `beeDebug` getter should check if there are any errors
   * here. Since the checks require async operations, this logic cannot be in the getter.
   */
  private debugApiErrors: string[] = []

  private async setupBeeDebug(): Promise<void> {
    if (!(await this.checkDebugApiHealth())) {
      this.debugApiErrors.push('Could not reach Debug API at ' + this.beeDebugApiUrl)
      this.debugApiErrors.push('Make sure you have the Debug API enabled in your Bee config')
      this.debugApiErrors.push('or correct the URL with the --bee-debug-api-url option.')
    }
  }

  protected debugApiIsUsable(): boolean {
    return this.debugApiErrors.length === 0
  }

  public get beeDebug(): BeeDebug {
    if (!this.debugApiIsUsable()) {
      for (const message of this.debugApiErrors) {
        this.console.error(message)
      }

      exit(1)
    }

    return this._beeDebug
  }

  protected async init(): Promise<void> {
    this.commandConfig = new CommandConfig(this.appName, this.console, this.configFile, this.configFolder)
    this.sourcemap = Utils.getSourcemap()

    CONFIG_OPTIONS.forEach((option: ConfigOption) => {
      this.maybeSetFromConfig(option)
    })

    const beeOptions: BeeOptions = {}

    if (this.curl) {
      beeOptions.onRequest = printCurlCommand
    }

    if (this.header.length) {
      beeOptions.headers = parseHeaders(this.header)
    }
    this.bee = new Bee(this.beeApiUrl, beeOptions)
    this._beeDebug = new BeeDebug(this.beeDebugApiUrl, beeOptions)
    this.verbosity = VerbosityLevel.Normal

    if (this.quiet) {
      this.verbosity = VerbosityLevel.Quiet
    } else if (this.verbose) {
      this.verbosity = VerbosityLevel.Verbose
    }
    this.console = new CommandLog(this.verbosity)

    await this.setupBeeDebug()
  }

  private maybeSetFromConfig(option: ConfigOption): void {
    if (this.sourcemap[option.optionKey] === 'default') {
      const value = this.commandConfig.config[option.propertyKey]

      if (value !== undefined) {
        this[option.propertyKey] = value
      }
    }
  }

  private async checkDebugApiHealth(): Promise<boolean> {
    try {
      const health = await this._beeDebug.getHealth()

      return health.status === 'ok'
    } catch (error) {
      return false
    }
  }
}
