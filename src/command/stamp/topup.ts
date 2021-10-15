import { LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { createSpinner } from '../../utils/spinner'
import { VerbosityLevel } from '../root-command/command-log'
import { StampCommand } from './stamp-command'

export class Topup extends StampCommand implements LeafCommand {
  public readonly name = 'topup'

  public readonly description = 'Increase amount of existing postage stamp'

  @Option({
    key: 'amount',
    description: 'Value per chunk in PLUR, deprecates over time with new blocks mined',
    type: 'bigint',
    required: true,
    minimum: 1,
  })
  public amount!: bigint

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.beeDebug, this.console)
    }

    const spinner = createSpinner('Topup in progress. This may take a while.')

    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      spinner.start()
    }

    try {
      await this.beeDebug.topUpBatch(this.stamp, this.amount.toString())
    } finally {
      spinner.stop()
    }

    await this.printDepthAndAmount(this.stamp)
  }
}
