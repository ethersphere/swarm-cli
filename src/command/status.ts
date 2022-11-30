import { NodeInfo, SUPPORTED_BEE_VERSION, SUPPORTED_BEE_VERSION_EXACT } from '@ethersphere/bee-js'
import chalk from 'chalk'
import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../utils/text'
import { RootCommand } from './root-command'

export class Status extends RootCommand implements LeafCommand {
  public readonly name = 'status'

  public readonly description = 'Check API availability and Bee compatibility'

  public async run(): Promise<void> {
    await super.init()

    this.console.log(chalk.bold('Bee Status'))
    this.console.divider()
    this.console.log(createKeyValue('Bee API URL', this.beeApiUrl))
    this.console.log(createKeyValue('Bee Debug API URL', this.beeDebugApiUrl))
    this.console.divider()
    await this.checkBeeApiConnection()
    const version = await this.checkBeeDebugApiConnection()
    await this.checkBeeVersionCompatibility()
    const topology = await this.checkTopology()
    const nodeInfo = await this.getNodeInfo()

    this.console.log(createKeyValue('Bee Version', version))
    this.console.log(createKeyValue('Tested with', SUPPORTED_BEE_VERSION + ' (' + SUPPORTED_BEE_VERSION_EXACT + ')'))

    if (nodeInfo) {
      this.console.divider()
      this.console.log(createKeyValue('Gateway Mode', nodeInfo.gatewayMode))
      this.console.log(createKeyValue('Bee Mode', nodeInfo.beeMode))
    }
    this.console.quiet('Bee version - ' + version)
    this.console.quiet('Tested with - ' + SUPPORTED_BEE_VERSION_EXACT)

    if (topology) {
      this.console.divider('=')
      this.console.log(chalk.bold('Topology'))
      this.console.divider()
      this.console.log(createKeyValue('Connected Peers', topology.connected))
      this.console.log(createKeyValue('Population', topology.population))
      this.console.log(createKeyValue('Depth', topology.depth))
      this.console.quiet(topology.connected + ' ' + topology.population + ' ' + topology.depth)
    }
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
      const health = await this._beeDebug.getHealth()
      this.printSuccessfulCheck('Bee Debug API Connection')

      return health.version
    } catch {
      this.handleFailedCheck('Bee Debug API Connection')

      return 'N/A'
    }
  }

  private async checkBeeVersionCompatibility(): Promise<void> {
    try {
      const compatible = await this._beeDebug.isSupportedVersion()

      if (compatible) {
        this.printSuccessfulCheck('Bee Version Compatibility')
      } else {
        this.handleFailedCheck('Bee Version Compatibility')
      }
    } catch {
      this.handleFailedCheck('Bee Version Compatibility')
    }
  }

  private async getNodeInfo(): Promise<NodeInfo | null> {
    try {
      const nodeInfo = await this._beeDebug.getNodeInfo()

      return nodeInfo
    } catch {
      return null
    }
  }

  private async checkTopology(): Promise<null | {
    connected: number
    population: number
    depth: number
  }> {
    try {
      const { connected, population, depth } = await this._beeDebug.getTopology()

      return {
        connected,
        population,
        depth,
      }
    } catch {
      return null
    }
  }

  private printSuccessfulCheck(message: string): void {
    this.console.log(chalk.bold.green('[OK]') + ' ' + message)
    this.console.quiet('OK - ' + message)
  }

  private handleFailedCheck(message: string): void {
    this.console.log(chalk.bold.red('[FAILED]') + ' ' + message)
    this.console.quiet('FAILED - ' + message)
    process.exitCode = 1
  }
}
