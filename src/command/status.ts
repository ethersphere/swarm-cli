import { BeeModes } from '@ethersphere/bee-js'
import { Numbers } from 'cafe-utility'
import chalk from 'chalk'
import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../utils/text'
import { RootCommand } from './root-command'

export class Status extends RootCommand implements LeafCommand {
  public readonly name = 'status'

  public readonly description = 'Check Bee status'

  public async run(): Promise<void> {
    await super.init()

    this.console.all(chalk.bold('Bee'))
    process.stdout.write(createKeyValue('API', this.beeApiUrl))
    try {
      await this.bee.checkConnection()
      process.stdout.write(chalk.bold.green(' [OK]') + '\n')
    } catch {
      process.stdout.write(chalk.bold.red(' [FAILED]') + '\n')
    }
    const versions = await this.bee.getVersions()
    this.console.all(createKeyValue('Version', versions.beeVersion))
    const nodeInfo = await this.bee.getNodeInfo()
    this.console.all(createKeyValue('Mode', nodeInfo.beeMode))

    if (nodeInfo.beeMode !== BeeModes.DEV) {
      this.console.all('')
      this.console.all(chalk.bold('Topology'))
      const topology = await this.bee.getTopology()
      this.console.all(createKeyValue('Connected Peers', topology.connected))
      this.console.all(createKeyValue('Population', topology.population))
      this.console.all(createKeyValue('Depth', topology.depth))
    }

    if (nodeInfo.beeMode !== BeeModes.ULTRA_LIGHT && nodeInfo.beeMode !== BeeModes.DEV) {
      this.console.all('')
      this.console.all(chalk.bold('Wallet'))
      const { bzzBalance, nativeTokenBalance } = await this.bee.getWalletBalance()
      this.console.all(createKeyValue('xBZZ', Numbers.fromDecimals(bzzBalance, 16)))
      this.console.all(createKeyValue('xDAI', Numbers.fromDecimals(nativeTokenBalance, 18)))
    }

    if (nodeInfo.beeMode !== BeeModes.ULTRA_LIGHT && nodeInfo.beeMode !== BeeModes.DEV) {
      this.console.all('')
      this.console.all(chalk.bold('Chequebook'))
      const { totalBalance, availableBalance } = await this.bee.getChequebookBalance()
      this.console.all(createKeyValue('Available xBZZ', Numbers.fromDecimals(availableBalance, 16)))
      this.console.all(createKeyValue('Total xBZZ', Numbers.fromDecimals(totalBalance, 16)))
    }

    if (nodeInfo.beeMode !== BeeModes.ULTRA_LIGHT && nodeInfo.beeMode !== BeeModes.DEV) {
      this.console.all('')
      this.console.all(chalk.bold('Staking'))
      const stake = await this.bee.getStake()
      this.console.all(createKeyValue('Staked xBZZ', Numbers.fromDecimals(stake, 16)))
    }

    if (nodeInfo.beeMode === BeeModes.FULL) {
      this.console.all('')
      this.console.all(chalk.bold('Redistribution'))
      const redistributionState = await this.bee.getRedistributionState()
      this.console.all(createKeyValue('Reward', Numbers.fromDecimals(redistributionState.reward, 16, 'xBZZ')))
      this.console.all(createKeyValue('Has sufficient funds', redistributionState.hasSufficientFunds))
      this.console.all(createKeyValue('Fully synced', redistributionState.isFullySynced))
      this.console.all(createKeyValue('Frozen', redistributionState.isFrozen))
      this.console.all(createKeyValue('Last selected round', redistributionState.lastSelectedRound))
      this.console.all(createKeyValue('Last played round', redistributionState.lastPlayedRound))
      this.console.all(createKeyValue('Last won round', redistributionState.lastWonRound))
      this.console.all(
        createKeyValue('Minimum gas funds', Numbers.fromDecimals(redistributionState.minimumGasFunds, 18, 'xDAI')),
      )
    }
  }
}
