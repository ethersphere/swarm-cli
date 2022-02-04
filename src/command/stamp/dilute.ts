import { LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { CommandLineError } from '../../utils/error'
import { stampProperties } from '../../utils/option'
import { createSpinner } from '../../utils/spinner'
import { VerbosityLevel } from '../root-command/command-log'
import { StampCommand } from './stamp-command'

export class Dilute extends StampCommand implements LeafCommand {
  public readonly name = 'dilute'

  public readonly description = 'Increase depth of existing postage stamp'

  @Option({
    key: 'depth',
    description: 'Depth of the postage stamp',
    type: 'number',
    required: true,
    minimum: 17,
    maximum: 255,
  })
  public depth!: number

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.beeDebug, this.console)
    }

    const details = await this.beeDebug.getPostageBatch(this.stamp)

    if (this.depth <= details.depth) {
      throw new CommandLineError(`This postage stamp already has depth ${details.depth}. The new value must be higher.`)
    }

    const spinner = createSpinner('Dilute in progress. This may take a while.')

    if (this.verbosity !== VerbosityLevel.Quiet && !this.curl) {
      spinner.start()
    }

    try {
      await this.beeDebug.diluteBatch(this.stamp, this.depth)
    } finally {
      spinner.stop()
    }

    await this.printDepthAndAmount(this.stamp)
  }
}
