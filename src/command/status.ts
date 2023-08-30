import { BeeModes } from '@ethersphere/bee-js'
import BigNumber from 'bignumber.js'
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
    process.stdout.write(createKeyValue('Debug API', this.beeDebugApiUrl))
    try {
      await this._beeDebug.getHealth()
      process.stdout.write(chalk.bold.green(' [OK]') + '\n')
    } catch {
      process.stdout.write(chalk.bold.red(' [FAILED]') + '\n')
    }
    const versions = await this._beeDebug.getVersions()
    this.console.all(createKeyValue('Version', versions.beeVersion))
    const nodeInfo = await this._beeDebug.getNodeInfo()
    this.console.all(createKeyValue('Mode', nodeInfo.beeMode))

    if (nodeInfo.beeMode !== BeeModes.DEV) {
      this.console.all('')
      this.console.all(chalk.bold('Topology'))
      const topology = await this._beeDebug.getTopology()
      this.console.all(createKeyValue('Connected Peers', topology.connected))
      this.console.all(createKeyValue('Population', topology.population))
      this.console.all(createKeyValue('Depth', topology.depth))
    }

    if (nodeInfo.beeMode !== BeeModes.ULTRA_LIGHT && nodeInfo.beeMode !== BeeModes.DEV) {
      this.console.all('')
      this.console.all(chalk.bold('Wallet'))
      const { bzzBalance, nativeTokenBalance } = await this._beeDebug.getWalletBalance()
      this.console.all(
        createKeyValue(
          'xBZZ',
          BigNumber(bzzBalance)
            .div(10 ** 16)
            .toString(10),
        ),
      )
      this.console.all(
        createKeyValue(
          'xDAI',
          BigNumber(nativeTokenBalance)
            .div(10 ** 18)
            .toString(10),
        ),
      )
    }

    if (nodeInfo.beeMode !== BeeModes.ULTRA_LIGHT && nodeInfo.beeMode !== BeeModes.DEV) {
      this.console.all('')
      this.console.all(chalk.bold('Chequebook'))
      const { totalBalance, availableBalance } = await this._beeDebug.getChequebookBalance()
      this.console.all(
        createKeyValue(
          'Available xBZZ',
          BigNumber(availableBalance)
            .div(10 ** 16)
            .toString(10),
        ),
      )
      this.console.all(
        createKeyValue(
          'Total xBZZ',
          BigNumber(totalBalance)
            .div(10 ** 16)
            .toString(10),
        ),
      )
    }

    if (nodeInfo.beeMode !== BeeModes.ULTRA_LIGHT && nodeInfo.beeMode !== BeeModes.DEV) {
      this.console.all('')
      this.console.all(chalk.bold('Staking'))
      const stake = await this._beeDebug.getStake()
      this.console.all(
        createKeyValue(
          'Staked BZZ',
          BigNumber(stake)
            .div(10 ** 16)
            .toString(10),
        ),
      )
    }

    if (nodeInfo.beeMode === BeeModes.FULL) {
      this.console.all('')
      this.console.all(chalk.bold('Redistribution'))
      const redistributionState = await this._beeDebug.getRedistributionState()
      this.console.all(createKeyValue('Reward', redistributionState.reward))
      this.console.all(createKeyValue('Has sufficient funds', redistributionState.hasSufficientFunds))
      this.console.all(createKeyValue('Fully synced', redistributionState.isFullySynced))
      this.console.all(createKeyValue('Frozen', redistributionState.isFrozen))
      this.console.all(createKeyValue('Last selected round', redistributionState.lastSelectedRound))
      this.console.all(createKeyValue('Last played round', redistributionState.lastPlayedRound))
      this.console.all(createKeyValue('Last won round', redistributionState.lastWonRound))
      this.console.all(createKeyValue('Minimum gas funds', redistributionState.minimumGasFunds))
    }
  }
}
