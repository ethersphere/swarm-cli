import Bee from '@ethersphere/bee-js'
import { ExternalOption } from 'furious-commander'

/**
 * This class can be parent of the Commands to handle root options of the CLI
 */
export class RootCommand {
  // CLI FIELDS

  @ExternalOption('https')
  private https!: boolean

  @ExternalOption('bee-host')
  private beeHost!: string

  @ExternalOption('bee-api-port')
  private beeApiPort!: number

  // CLASS FIELDS

  /** assembled API URL of Bee */
  public beeApiUrl!: string

  public bee!: Bee

  /** Gives back URL string */
  protected assembleEndpoint(https: boolean, beeHost: string, port: number): string {
    return `${https ? 'https' : 'http'}://${beeHost}:${port}`
  }

  /**
   * Init Root command fields
   *
   * if BEE_API_URL environment variable has been set the CLI will use that connection string
   */
  protected init(): void {
    this.beeApiUrl = process.env.BEE_URL || this.assembleEndpoint(this.https, this.beeHost, this.beeApiPort)
    this.bee = new Bee(this.beeApiUrl)
  }
}
