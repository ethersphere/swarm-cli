import { System } from 'cafe-utility'
import { LeafCommand } from 'furious-commander'
import { createSpinner } from '../../utils/spinner'
import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'

export class Rchash extends RootCommand implements LeafCommand {
  public readonly name = 'rchash'

  public readonly description = 'Check reserve sampling duration'

  public async run(): Promise<void> {
    super.init()
    const addresses = await this.bee.getNodeAddresses()
    const topology = await this.bee.getTopology()
    let stillRunning = true
    const promise = this.bee.rchash(topology.depth, addresses.overlay.toHex(), addresses.overlay.toHex())
    promise.finally(() => {
      stillRunning = false
    })
    const startedAt = Date.now()
    const spinner = createSpinner('Running rchash...').start()
    while (stillRunning) {
      await System.sleepMillis(1000)
      const duration = (Date.now() - startedAt) / 1000
      spinner.text = `Running rchash ${duration.toFixed()}s`
    }
    spinner.stop()
    const result = await promise
    this.console.log(createKeyValue('Reserve sampling duration', result + ' seconds'))
  }
}
