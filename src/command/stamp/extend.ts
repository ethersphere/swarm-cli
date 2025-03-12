import { Duration, Size } from '@ethersphere/bee-js'
import { Dates, Numbers } from 'cafe-utility'
import { LeafCommand } from 'furious-commander'
import { exit } from 'process'
import { pickStamp } from '../../service/stamp'
import { createSpinner } from '../../utils/spinner'
import { VerbosityLevel } from '../root-command/command-log'
import { StampCommand } from './stamp-command'

export class Extend extends StampCommand implements LeafCommand {
  public readonly name = 'extend'

  public readonly description = 'Extend storage size or duration'

  public async run(): Promise<void> {
    super.init()

    const batches = await this.bee.getAllPostageBatch()
    const batchId = await pickStamp(this.bee, this.console)
    const batch = batches.find(b => b.batchID.toHex() === batchId)

    if (!batch) {
      throw Error(`Batch with ID ${batchId} not found`)
    }

    const { bzzBalance } = await this.bee.getWalletBalance()
    const mode = await this.console.promptList(['Size', 'Duration'], 'What do you want to extend?')

    this.console.log(`Current balance is ${bzzBalance.toDecimalString()} BZZ`)

    if (mode === 'Size') {
      this.console.log(`Current size is ${batch.size.toFormattedString()}`)
      const wantedSize = await this.console.askForValue('New size')
      const size = Size.fromBytes(Numbers.makeStorage(wantedSize))
      const cost = await this.bee.getSizeExtensionCost(batchId, size)

      if (cost.gt(bzzBalance)) {
        this.console.error(`Need ${cost.toDecimalString()} BZZ to extend the size to ${size.toFormattedString()}`)
        exit(1)
      }

      const confirm = await this.console.confirm(
        `Do you want to extend the size to ${size.toFormattedString()} bytes for ${cost.toDecimalString()} BZZ?`,
      )

      if (confirm) {
        const spinner = createSpinner('This may take a few minutes.')

        if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
          spinner.start()
        }

        try {
          await this.bee.extendStorageSize(batchId, size)
        } finally {
          spinner.stop()
        }
      }
    } else {
      this.console.log(`Current duration is ${batch.duration.toDays().toFixed(2)} days`)
      const wantedLength = await this.console.askForValue('Add duration')
      const addedDuration = Duration.fromMilliseconds(Dates.make(wantedLength))
      const totalDuration = Duration.fromMilliseconds(Dates.make(wantedLength) + batch.duration.toSeconds() * 1000)
      const cost = await this.bee.getDurationExtensionCost(batchId, addedDuration)

      if (cost.gt(bzzBalance)) {
        this.console.error(
          `Need ${cost.toDecimalString()} BZZ to extend the duration to ${totalDuration.toDays().toFixed(2)} days`,
        )
        exit(1)
      }

      const confirm = await this.console.confirm(
        `Do you want to extend the duration to a total of ${totalDuration
          .toDays()
          .toFixed(2)} days for ${cost.toDecimalString()} BZZ?`,
      )

      if (confirm) {
        const spinner = createSpinner('This may take a few minutes.')

        if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
          spinner.start()
        }

        try {
          await this.bee.extendStorageDuration(batchId, addedDuration)
        } finally {
          spinner.stop()
        }
      }
    }
  }
}
