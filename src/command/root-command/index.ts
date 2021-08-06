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
  public _beeDebug?: BeeDebug
  public get beeDebug(): BeeDebug {
    if (!this._beeDebug) {
      this.console.error('Cannot ensure Debug API correctness!')
      this.console.error('--bee-api-url is set explicitly, but --bee-debug-api-url is left default.')
      this.console.error('This may be incorrect and cause unexpected behaviour.')
      this.console.error('Please run the command again and specify explicitly the --bee-debug-api-url value.')
      exit(1)
    }

    return this._beeDebug
  }

  public console!: CommandLog
  public appName = 'swarm-cli'
  public commandConfig!: CommandConfig

  private sourcemap!: Sourcemap

  protected init(): void {
    this.commandConfig = new CommandConfig(this.appName, this.console, this.configFile, this.configFolder)
    this.sourcemap = Utils.getSourcemap()

    CONFIG_OPTIONS.forEach((option: ConfigOption) => {
      this.maybeSetFromConfig(option)
    })

    this.bee = new Bee(this.beeApiUrl)
    this._beeDebug = this.shouldDebugUrlBeSpecified() ? undefined : new BeeDebug(this.beeDebugApiUrl)
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
}
