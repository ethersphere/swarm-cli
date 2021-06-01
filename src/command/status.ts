import { LeafCommand } from 'furious-commander'
import { bold, green, red, yellow } from 'kleur'
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
    this.console.log(bold('Bee Version: ' + yellow(version)))
    this.console.quiet(version)
  }

  private async checkBeeApiConnection(): Promise<void> {
    try {
      await this.bee.checkConnection()
      this.printSuccessfulCheck('Bee API Connection')
    } catch {
      this.printFailedCheck('Bee API Connection')
    }
  }

  private async checkBeeDebugApiConnection(): Promise<string> {
    try {
      const health = await this.beeDebug.getHealth()
      this.printSuccessfulCheck('Bee Debug API Connection')

      return health.version
    } catch {
      this.printFailedCheck('Bee Debug API Connection')

      return 'N/A'
    }
  }

  private async checkBeeVersionCompatibility(): Promise<void> {
    try {
      const compatible = await this.beeDebug.isSupportedVersion()

      if (compatible) {
        this.printSuccessfulCheck('Bee Version Compatibility')
      } else {
        this.printFailedCheck('Bee Version Compatibility')
      }
    } catch {
      this.printFailedCheck('Bee Version Compatibility')
    }
  }

  private printSuccessfulCheck(message: string): void {
    this.console.log(bold(green('[OK]')) + ' ' + message)
    this.console.quiet('OK - ' + message)
  }

  private printFailedCheck(message: string): void {
    this.console.log(bold(red('[FAILED]')) + ' ' + message)
    this.console.quiet('FAILED - ' + message)
  }
}
