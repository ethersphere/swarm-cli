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
  public beeDebug?: BeeDebug

  public getBeeDebug(): BeeDebug {
    if (!this.beeDebug) {
      this.console.error('Cannot ensure Debug API correctness!')
      this.console.error('--bee-api-url is set explicitly to a non-local address.')
      this.console.error('--bee-debug-api-url is still set to its default localhost value, which may be incorrect.')
      this.console.error('Please run the command again and specify explicitly the --bee-debug-api-url value.')
      exit(1)
    }

    return this.beeDebug
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
    this.beeDebug = new BeeDebug(this.beeDebugApiUrl)
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

    if (
      this.sourcemap['bee-api-url'] === 'explicit' &&
      !this.beeApiUrl.startsWith('http://localhost:') &&
      this.sourcemap['bee-debug-api-url'] === 'default'
    ) {
      this.beeDebug = undefined
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
}
