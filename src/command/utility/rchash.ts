import { System } from 'cafe-utility'
import { LeafCommand, Option } from 'furious-commander'
import { createSpinner } from '../../utils/spinner'
import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'

export class Rchash extends RootCommand implements LeafCommand {
  public readonly name = 'rchash'

  public readonly description = 'Check reserve sampling duration'

  @Option({
    key: 'depth',
    type: 'number',
    minimum: 0,
    maximum: 32,
    description: 'Depth to use for sampling (default: committedDepth from node status)',
  })
  public depth!: number

  public async run(): Promise<void> {
    super.init()
    const addresses = await this.bee.getNodeAddresses()
    const status = await this.bee.getStatus()
    const depth = this.depth ?? status.committedDepth
    const anchor = addresses.overlay.toHex().slice(0, Math.max(2, Math.ceil(depth / 8) * 2))
    let stillRunning = true
    const promise = this.bee.rchash(depth, anchor, anchor)
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
