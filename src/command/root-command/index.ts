import { Bee, BeeDebug } from '@ethersphere/bee-js'
import { ExternalOption } from 'furious-commander'
import { CommandConfig } from './command-config'
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

  protected init(): void {
    this.bee = new Bee(this.beeApiUrl)
    this.beeDebug = new BeeDebug(this.beeDebugApiUrl)
    this.commandConfig = new CommandConfig(this.appName, this.console, this.configFolder)
    this.verbosity = VerbosityLevel.Normal

    if (this.quiet) {
      this.verbosity = VerbosityLevel.Quiet
    } else if (this.verbose) {
      this.verbosity = VerbosityLevel.Verbose
    }
    this.console = new CommandLog(this.verbosity)
  }
}
