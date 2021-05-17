import { LeafCommand, Option } from 'furious-commander'
import { StampCommand } from './stamp-command'

export class Buy extends StampCommand implements LeafCommand {
  public readonly name = 'buy'

  public readonly aliases = []

  public readonly description = 'Buy postage stamp'

  @Option({ key: 'depth', description: 'Depth of the postage stamp', type: 'number', required: true, minimum: 17 })
  public depth!: number

  @Option({ key: 'amount', description: 'Amount of the postage stamp', type: 'bigint', required: true, minimum: 1 })
  public amount!: bigint

  @Option({ key: 'label', description: 'Label of the postage stamp' })
  public label!: string

  public async run(): Promise<void> {
    super.init()

    this.console.verbose('Buying postage stamp...')

    const batchId = await this.bee.createStampBatch(this.amount, this.depth, this.label)

    this.printBatchId(batchId)
  }
}
