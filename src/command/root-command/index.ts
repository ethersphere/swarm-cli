import { Bee } from '@ethersphere/bee-js'
import { ExternalOption } from 'furious-commander'
import { beeApiUrl, configFolder } from '../../config'
import { IOption } from 'furious-commander/dist/option'
import { CommandConfig } from './command-config'

/**
 * This class can be parent of the Commands to handle root options of the CLI
 */
export class RootCommand {
  // CLI FIELDS

  /** API URL of Bee */
  @ExternalOption('bee-api-url')
  public beeApiUrl!: string

  @ExternalOption('config-folder')
  public configFolder!: string

  // CLASS FIELDS

  public appName = 'swarm-cli'

  public bee!: Bee

  public commandConfig!: CommandConfig

  /**
   * Init Root command fields
   *
   * if BEE_API_URL environment variable has been set the CLI will use that connection string
   */
  protected init(): void {
    if (!this.optionPassed(configFolder)) {
      if (process.env.SWARM_CLI_CONFIG_FOLDER) this.configFolder = process.env.SWARM_CLI_CONFIG_FOLDER
    }
    this.commandConfig = new CommandConfig(this.appName, this.configFolder)

    if (!this.optionPassed(beeApiUrl)) {
      if (process.env.BEE_API_URL) this.beeApiUrl = process.env.BEE_API_URL
      else if (this.commandConfig.config.beeApiUrl) this.beeApiUrl = this.commandConfig.config.beeApiUrl
    } // else it gets its default option value

    this.bee = new Bee(this.beeApiUrl)
  }

  protected optionPassed(option: IOption): boolean {
    return process.argv.includes(`--${option.key}`)
  }
}
