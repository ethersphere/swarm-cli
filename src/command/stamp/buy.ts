import { LeafCommand, Option } from 'furious-commander'
import { printEnrichedStamp } from '../../service/stamp'
import { sleep } from '../../utils'
import { createSpinner } from '../../utils/spinner'
import { createKeyValue, deletePreviousLine } from '../../utils/text'
import { VerbosityLevel } from '../root-command/command-log'
import { StampCommand } from './stamp-command'

export class Buy extends StampCommand implements LeafCommand {
  public readonly name = 'buy'

  public readonly description = 'Buy postage stamp'

  @Option({
    key: 'depth',
    description: 'Depth of the postage stamp',
    type: 'number',
    required: true,
    minimum: 17,
    maximum: 255,
  })
  public depth!: number

  @Option({
    key: 'amount',
    description: 'Value per chunk in PLUR, deprecates over time with new blocks mined',
    type: 'bigint',
    required: true,
    minimum: 1,
  })
  public amount!: bigint

  @Option({
    key: 'gas-price',
    description: 'Gas price of the transaction in wei',
    type: 'bigint',
    minimum: 0,
  })
  public gasPrice!: bigint

  @Option({ key: 'immutable', description: 'Disable stamp reuse', type: 'boolean' })
  public immutable!: boolean

  @Option({ key: 'label', description: 'Label of the postage stamp' })
  public label!: string

  @Option({ key: 'wait-usable', description: 'Wait until the postage stamp becomes usable', type: 'boolean' })
  public waitUsable!: boolean

  // CLASS FIELDS

  public postageBatchId!: string

  public async run(): Promise<void> {
    super.init()

    if (this.verbose && !this.waitUsable) {
      this.console.log(
        'You are running in verbose mode, but additional stamp information is only available after a short waiting period.',
      )
      this.console.log('You can wait for it using the --wait-usable flag.')
      this.waitUsable = await this.console.confirm('Would you like to enable it now?')
    }

    const spinner = createSpinner('Buying postage stamp. This may take a while.')

    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      spinner.start()
    }

    try {
      const batchId = await this.bee.createPostageBatch(this.amount.toString(), this.depth, {
        label: this.label,
        gasPrice: this.gasPrice?.toString(),
        immutableFlag: this.immutable,
      })
      spinner.stop()
      this.console.quiet(batchId)
      this.console.log(createKeyValue('Stamp ID', batchId))
      this.postageBatchId = batchId
    } finally {
      spinner.stop()
    }

    if (this.waitUsable) {
      await this.waitToBecomeUsable()
    }
  }

  private async waitToBecomeUsable(): Promise<void> {
    const spinner = createSpinner('Waiting for postage stamp to become usable...')

    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      spinner.start()
    }
    let running = true

    while (running) {
      try {
        const stamp = await this.bee.getPostageBatch(this.postageBatchId)

        if (!stamp.usable) {
          await sleep(1000)
          continue
        }

        spinner.stop()

        if (this.verbosity === VerbosityLevel.Verbose) {
          if (!this.curl) {
            deletePreviousLine()
          }
          printEnrichedStamp(stamp, this.console)
        }
        running = false
      } catch {
        await sleep(1000)
      }
    }
    spinner.stop()
  }
}
