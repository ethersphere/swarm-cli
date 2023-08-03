import { Argument, LeafCommand } from 'furious-commander'
import { enrichStamp, pickStamp, printStamp } from '../../service/stamp'
import { stampProperties } from '../../utils/option'
import { StampCommand } from './stamp-command'

export class Show extends StampCommand implements LeafCommand {
  public readonly name = 'show'

  public readonly description = 'Show a specific postage stamp'

  @Argument(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.beeDebug, this.console)
    }

    this.console.verbose(`Looking up postage stamp ${this.stamp}...`)

    const stamp = enrichStamp(await this.beeDebug.getPostageBatch(this.stamp))

    printStamp(stamp, this.console, { printUsageInQuiet: true, showTtl: true })
  }
}
