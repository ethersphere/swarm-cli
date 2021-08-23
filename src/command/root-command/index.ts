import { Bee, BeeDebug } from '@ethersphere/bee-js'
import { ExternalOption, Sourcemap, Utils } from 'furious-commander'
import { exit } from 'process'
import { registerCurlHook } from '../../curl'
import { ConfigOption } from '../../utils/types/config-option'
import { CommandConfig, CONFIG_OPTIONS } from './command-config'
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

  public bee!: Bee
  public _beeDebug!: BeeDebug
  public console!: CommandLog
  public appName = 'swarm-cli'
  public commandConfig!: CommandConfig
  private sourcemap!: Sourcemap
  /**
   * Store Debug API errors here. It cannot be determined beforehand if Debug API is going to be used,
   * since it is optional for some commands. The `beeDebug` getter should check if there are any errors
   * here. Since the checks require async operations, this logic cannot be in the getter.
   */
  private debugApiErrors: string[] = []

  private async setupBeeDebug(): Promise<void> {
    if (this.shouldDebugUrlBeSpecified()) {
      this.debugApiErrors.push('Cannot ensure Debug API correctness!')
      this.debugApiErrors.push('--bee-api-url is set explicitly, but --bee-debug-api-url is left default.')
      this.debugApiErrors.push('This may be incorrect and cause unexpected behaviour.')
      this.debugApiErrors.push('Please run the command again and specify explicitly the --bee-debug-api-url value.')
    } else {
      if (!(await this.checkDebugApiHealth())) {
        this.debugApiErrors.push('Could not reach Debug API at ' + this.beeDebugApiUrl)
        this.debugApiErrors.push('Make sure you have the Debug API enabled in your Bee config')
        this.debugApiErrors.push('or correct the URL with the --bee-debug-api-url option.')
      }
    }
  }

  public get beeDebug(): BeeDebug {
    if (this.debugApiErrors.length) {
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

    this.bee = new Bee(this.beeApiUrl)
    this._beeDebug = new BeeDebug(this.beeDebugApiUrl)
    this.verbosity = VerbosityLevel.Normal

    if (this.quiet) {
      this.verbosity = VerbosityLevel.Quiet
    } else if (this.verbose) {
      this.verbosity = VerbosityLevel.Verbose
    }
    this.console = new CommandLog(this.verbosity)

    if (this.curl) {
      registerCurlHook()
    }
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

  /**
   * Used to catch confusing behaviour, which happens when only one of the Bee APIs is specified.
   *
   * e.g. A command uses both the Bee API and the Bee Debug API. The user specifies a remote Bee node
   *      for the normal API, but forgets about the debug API. The command would run successfully,
   *      but have confusing results, as two different Bee nodes are used when calling the APIs.
   *
   * @returns true is Bee API URL is set explicity, but Bee Debug API URL is left default.
   */
  private shouldDebugUrlBeSpecified(): boolean {
    return this.sourcemap['bee-api-url'] === 'explicit' && this.sourcemap['bee-debug-api-url'] === 'default'
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
