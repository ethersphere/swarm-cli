import Bee from '@ethersphere/bee-js'
import { ExternalOption } from 'furious-commander'
import { defaultBeeApiUrl } from '../config'

/**
 * This class can be parent of the Commands to handle root options of the CLI
 */
export class RootCommand {
  // CLI FIELDS

  /** API URL of Bee */
  @ExternalOption('bee-api-url')
  public beeApiUrl!: string

  // CLASS FIELDS

  public bee!: Bee

  /**
   * Init Root command fields
   *
   * if BEE_API_URL environment variable has been set the CLI will use that connection string
   */
  protected init(): void {
    this.beeApiUrl = this.beeApiUrl === defaultBeeApiUrl ? process.env.BEE_API_URL || this.beeApiUrl : this.beeApiUrl
    this.bee = new Bee(this.beeApiUrl)
  }
}
