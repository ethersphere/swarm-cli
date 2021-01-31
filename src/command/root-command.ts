import Bee from '@ethersphere/bee-js'
import { ExternalOption } from 'furious-commander'
import { beeApiUrl } from '../config'
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
    this.commandConfig = new CommandConfig(this.appName, this.configFolder)
    this.beeApiUrl = this.optionPassed(beeApiUrl)
      ? this.beeApiUrl
      : this.commandConfig.config.beeApiUrl || process.env.BEE_API_URL || this.beeApiUrl
    this.bee = new Bee(this.beeApiUrl)
  }

  protected optionPassed(option: IOption): boolean {
    return Boolean(process.argv.indexOf(`--${option.key}`) > -1)
  }
}
