import { Bee, BeeOptions, Reference } from '@upcoming/bee-js'
import { Optional } from 'cafe-utility'
import { ExternalOption, Sourcemap, Utils } from 'furious-commander'
import { printCurlCommand } from '../../curl'
import { parseHeaders } from '../../utils'
import { ConfigOption } from '../../utils/types/config-option'
import { CONFIG_OPTIONS, CommandConfig } from './command-config'
import { CommandLog, VerbosityLevel } from './command-log'

export class RootCommand {
  @ExternalOption('bee-api-url')
  public beeApiUrl!: string

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

  public console!: CommandLog

  public readonly appName = 'swarm-cli'

  public commandConfig!: CommandConfig

  private sourcemap!: Sourcemap

  /**
   * Resulting reference of the command for reflection (e.g. in tests)
   */
  public result: Optional<Reference> = Optional.empty()

  protected init(): void {
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
      const value = this.commandConfig.config[option.propertyKey]

      if (value !== undefined) {
        this[option.propertyKey] = value
      }
    }
  }
}
