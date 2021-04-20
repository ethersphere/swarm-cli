import { Bee, BeeDebug } from '@ethersphere/bee-js'
import { ExternalOption } from 'furious-commander'
import { IOption } from 'furious-commander/dist/option'
import { beeApiUrl, configFolder, quiet, verbose } from '../../config'
import { CommandConfig } from './command-config'
import { CommandLog, VerbosityLevel } from './command-log'

/**
 * This class can be parent of the Commands to handle root options of the CLI
 */
export class RootCommand {
  // CLI FIELDS

  /** API URL of Bee */
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

  // CLASS FIELDS

  public appName = 'swarm-cli'

  public bee!: Bee

  public beeDebug!: BeeDebug

  public commandConfig!: CommandConfig

  public console!: CommandLog

  /**
   * Init Root command fields
   *
   * if BEE_API_URL environment variable has been set the CLI will use that connection string
   */
  protected init(): void {
    // Console logs of default commands
    this.verbosity = VerbosityLevel.Normal

    if (this.optionPassed(quiet)) {
      this.verbosity = VerbosityLevel.Quiet
    }

    if (this.optionPassed(verbose)) {
      this.verbosity = VerbosityLevel.Verbose
    }
    this.console = new CommandLog(this.verbosity)

    // CLI Configuration
    if (!this.optionPassed(configFolder)) {
      if (process.env.SWARM_CLI_CONFIG_FOLDER) this.configFolder = process.env.SWARM_CLI_CONFIG_FOLDER
    }
    this.commandConfig = new CommandConfig(this.appName, this.console, this.configFolder)

    if (!this.optionPassed(beeApiUrl)) {
      if (process.env.BEE_API_URL) this.beeApiUrl = process.env.BEE_API_URL
      else if (this.commandConfig.config.beeApiUrl) this.beeApiUrl = this.commandConfig.config.beeApiUrl
    } // else it gets its default option value

    this.bee = new Bee(this.beeApiUrl)
    this.beeDebug = new BeeDebug(this.beeDebugApiUrl)
  }

  protected optionPassed(option: IOption): boolean {
    return process.argv.includes(`--${option.key}`) || process.argv.includes(`-${option.alias}`)
  }
}
