import { BigNumber } from 'bignumber.js'
import { LeafCommand, Option } from 'furious-commander'
import { printStamp } from '../../service/stamp'
import { sleep, toSignificantDigits } from '../../utils'
import { PLURConversionRate } from '../../utils/conversions'
import { createSpinner } from '../../utils/spinner'
import { Storage } from '../../utils/storage'
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
    await super.init()

    if (this.verbose && !this.waitUsable) {
      this.console.log(
        'You are running in verbose mode, but additional stamp information is only available after a short waiting period.',
      )
      this.console.log('You can await this using the --wait-usable flag.')
      this.waitUsable = await this.console.confirm('Would you like to enable it now?')
    }

    const estimatedCost = BigNumber(this.amount.toString())
      .multipliedBy(BigNumber(2).pow(this.depth))
      .dividedBy(PLURConversionRate)

    const expectedCapacity = new Storage(2 ** this.depth * 4096)
    this.console.log(
      `The estimated cost is ${toSignificantDigits(
        estimatedCost,
      )} BZZ, expected capacity is at most ${expectedCapacity}`,
    )

    if (!this.quiet && !this.yes) {
      this.yes = await this.console.confirm('Confirm the purchase')
    }

    if (!this.yes && !this.quiet) {
      return
    }

    const spinner = createSpinner('Buying postage stamp. This may take a while.')

    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      spinner.start()
    }

    try {
      const batchId = await this.beeDebug.createPostageBatch(this.amount.toString(), this.depth, {
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
        const stamp = await this.beeDebug.getPostageBatch(this.postageBatchId)

        if (!stamp.usable) {
          await sleep(1000)
          continue
        }

        spinner.stop()

        if (this.verbosity === VerbosityLevel.Verbose) {
          if (!this.curl) {
            deletePreviousLine()
          }
          printStamp(stamp, this.console, { showTtl: true })
        }
        running = false
      } catch {
        await sleep(1000)
      }
    }
    spinner.stop()
  }
}
