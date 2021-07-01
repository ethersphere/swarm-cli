import { SUPPORTED_BEE_VERSION, SUPPORTED_BEE_VERSION_EXACT } from '@ethersphere/bee-js'
import { LeafCommand } from 'furious-commander'
import { bold, green, red } from 'kleur'
import { createKeyValue } from '../utils/text'
import { RootCommand } from './root-command'

export class Status extends RootCommand implements LeafCommand {
  public readonly name = 'status'

  public readonly description = 'Check API availability and Bee compatibility'

  public async run(): Promise<void> {
    super.init()

    await this.checkBeeApiConnection()
    const version = await this.checkBeeDebugApiConnection()
    await this.checkBeeVersionCompatibility()

    this.console.divider()
    this.console.log(createKeyValue('Bee Version', version, 'Supported Version'.length))
    this.console.log(
      createKeyValue('Supported Version', SUPPORTED_BEE_VERSION + ' (' + SUPPORTED_BEE_VERSION_EXACT + ')'),
    )
    this.console.quiet('Bee version - ' + version)
    this.console.quiet('Supported version - ' + SUPPORTED_BEE_VERSION_EXACT)
  }

  private async checkBeeApiConnection(): Promise<void> {
    try {
      await this.bee.checkConnection()
      this.printSuccessfulCheck('Bee API Connection')
    } catch {
      this.handleFailedCheck('Bee API Connection')
    }
  }

  private async checkBeeDebugApiConnection(): Promise<string> {
    try {
      const health = await this.beeDebug.getHealth()
      this.printSuccessfulCheck('Bee Debug API Connection')

      return health.version
    } catch {
      this.handleFailedCheck('Bee Debug API Connection')

      return 'N/A'
    }
  }

  private async checkBeeVersionCompatibility(): Promise<void> {
    try {
      const compatible = await this.beeDebug.isSupportedVersion()

      if (compatible) {
        this.printSuccessfulCheck('Bee Version Compatibility')
      } else {
        this.handleFailedCheck('Bee Version Compatibility')
      }
    } catch {
      this.handleFailedCheck('Bee Version Compatibility')
    }
  }

  private printSuccessfulCheck(message: string): void {
    this.console.log(bold(green('[OK]')) + ' ' + message)
    this.console.quiet('OK - ' + message)
  }

  private handleFailedCheck(message: string): void {
    this.console.log(bold(red('[FAILED]')) + ' ' + message)
    this.console.quiet('FAILED - ' + message)
    process.exitCode = 1
  }
}
