import { Bee, BeeDebug } from '@ethersphere/bee-js'
import { ExternalOption, Sourcemap, Utils } from 'furious-commander'
import { CommandConfig, ConfigOption, CONFIG_OPTIONS } from './command-config'
import { CommandLog, VerbosityLevel } from './command-log'

export class RootCommand {
  @ExternalOption('bee-api-url')
  public beeApiUrl!: string

  @ExternalOption('bee-debug-api-url')
  public beeDebugApiUrl!: string

  @ExternalOption('config-folder')
  public configFolder!: string

  @ExternalOption('verbosity')
  public verbosity!: VerbosityLevel

  @ExternalOption('verbose')
  public verbose!: boolean

  @ExternalOption('quiet')
  public quiet!: boolean

  public bee!: Bee
  public beeDebug!: BeeDebug
  public console!: CommandLog
  public appName = 'swarm-cli'
  public commandConfig!: CommandConfig

  private sourcemap!: Sourcemap

  protected init(): void {
    this.commandConfig = new CommandConfig(this.appName, this.console, this.configFolder)
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
  }

  private maybeSetFromConfig(option: ConfigOption): void {
    if (this.sourcemap[option.optionKey] === 'default') {
      const value = Reflect.get(this.commandConfig.config, option.propertyKey)

      if (value !== undefined) {
        Reflect.set(this, option.propertyKey, value)
      }
    }
  }
}
