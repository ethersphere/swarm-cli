import { BeeModes } from '@ethersphere/bee-js'
import chalk from 'chalk'
import { LeafCommand } from 'furious-commander'
import { exit } from 'process'
import { createKeyValue } from '../utils/text'
import { RootCommand } from './root-command'

export class Status extends RootCommand implements LeafCommand {
  public readonly name = 'status'

  public readonly description = 'Check Bee status'

  public async run(): Promise<void> {
    super.init()

    this.console.all(chalk.bold('Bee'))
    process.stdout.write(createKeyValue('API', this.beeApiUrl))
    try {
      await this.bee.checkConnection()
      process.stdout.write(chalk.bold.green(' [OK]') + '\n')
    } catch {
      process.stdout.write(chalk.bold.red(' [FAILED]') + '\n')
      process.stdout.write('\nIs your Bee node running?\n')
      exit(1)
    }
    const versions = await this.bee.getVersions()
    this.console.all(createKeyValue('Version', versions.beeVersion))
    const nodeInfo = await this.bee.getNodeInfo()
    this.console.all(createKeyValue('Mode', nodeInfo.beeMode))

    if (nodeInfo.beeMode !== BeeModes.ULTRA_LIGHT && nodeInfo.beeMode !== BeeModes.DEV) {
      this.console.all('')
      this.console.all(chalk.bold('Chainsync'))
      const { block, chainTip } = await this.bee.getChainState()
      this.console.all(
        createKeyValue(
          'Block',
          `${block.toLocaleString()} / ${chainTip.toLocaleString()} (Δ ${(chainTip - block).toLocaleString()})`,
        ),
      )
    }

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
      this.console.all(createKeyValue('xBZZ', bzzBalance.toDecimalString()))
      this.console.all(createKeyValue('xDAI', nativeTokenBalance.toDecimalString()))
    }

    if (nodeInfo.beeMode !== BeeModes.ULTRA_LIGHT && nodeInfo.beeMode !== BeeModes.DEV) {
      this.console.all('')
      this.console.all(chalk.bold('Chequebook'))
      const { totalBalance, availableBalance } = await this.bee.getChequebookBalance()
      this.console.all(createKeyValue('Available xBZZ', availableBalance.toDecimalString()))
      this.console.all(createKeyValue('Total xBZZ', totalBalance.toDecimalString()))
    }

    if (nodeInfo.beeMode !== BeeModes.ULTRA_LIGHT && nodeInfo.beeMode !== BeeModes.DEV) {
      this.console.all('')
      this.console.all(chalk.bold('Staking'))
      const stake = await this.bee.getStake()
      this.console.all(createKeyValue('Staked xBZZ', stake.toDecimalString()))
    }

    if (nodeInfo.beeMode === BeeModes.FULL) {
      const reserveStatus = await this.bee.getStatus()
      this.console.all('')
      this.console.all(chalk.bold('Reserve'))
      this.console.all(
        createKeyValue(
          'Pullsync rate',
          reserveStatus.pullsyncRate.toFixed(2) +
            ' chunks/s (' +
            ((reserveStatus.pullsyncRate * 4096) / 1024 / 1024).toFixed(2) +
            ' MB/s)',
        ),
      )
      this.console.all(
        createKeyValue(
          'Reserve size',
          reserveStatus.reserveSize.toLocaleString() +
            ' chunks (' +
            ((reserveStatus.reserveSize * 4096) / 1024 / 1024 / 1024).toFixed() +
            ' GB)',
        ),
      )

      this.console.all(
        createKeyValue(
          'Reserve size within radius',
          reserveStatus.reserveSizeWithinRadius.toLocaleString() +
            ' chunks (' +
            ((reserveStatus.reserveSizeWithinRadius * 4096) / 1024 / 1024 / 1024).toFixed() +
            ' GB)',
        ),
      )
      this.console.all('')
      this.console.all(chalk.bold('Redistribution'))
      const redistributionState = await this.bee.getRedistributionState()
      this.console.all(createKeyValue('Reward', redistributionState.reward.toDecimalString()))
      this.console.all(createKeyValue('Has sufficient funds', redistributionState.hasSufficientFunds))
      this.console.all(createKeyValue('Fully synced', redistributionState.isFullySynced))
      this.console.all(createKeyValue('Frozen', redistributionState.isFrozen))
      this.console.all(createKeyValue('Last selected round', redistributionState.lastSelectedRound))
      this.console.all(createKeyValue('Last played round', redistributionState.lastPlayedRound))
      this.console.all(createKeyValue('Last won round', redistributionState.lastWonRound))
      this.console.all(createKeyValue('Minimum gas funds', redistributionState.minimumGasFunds.toDecimalString()))
    }
  }
}
