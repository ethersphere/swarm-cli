import { LeafCommand, Option } from 'furious-commander'
import ora from 'ora'
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
    minimum: 16,
    maximum: 255,
  })
  public depth!: number

  @Option({
    key: 'amount',
    description: 'Value per chunk, deprecates over time with new blocks mined',
    type: 'bigint',
    required: true,
    minimum: 1,
  })
  public amount!: bigint

  @Option({
    key: 'gas-price',
    description: 'Gas price of the transaction',
    type: 'bigint',
    minimum: 0,
  })
  public gasPrice!: bigint

  @Option({ key: 'label', description: 'Label of the postage stamp' })
  public label!: string

  // CLASS FIELDS

  public postageBatchId!: string

  public async run(): Promise<void> {
    super.init()

    const spinner: ora.Ora = ora('Buying postage stamp. This may take a while.')

    if (this.verbosity !== VerbosityLevel.Quiet) {
      spinner.start()
    }

    try {
      const batchId = await this.bee.createPostageBatch(this.amount, this.depth, {
        label: this.label,
        gasPrice: this.gasPrice,
      })
      this.printBatchId(batchId)
      this.postageBatchId = batchId
    } finally {
      if (spinner.isSpinning) {
        spinner.stop()
      }
    }
  }
}
