import { bold } from 'kleur'
import { EnrichedStamp } from '../../service/stamp/types/stamp'
import { RootCommand } from '../root-command'

export class StampCommand extends RootCommand {
  protected printStamp(stamp: EnrichedStamp): void {
    this.console.divider('-')
    this.console.log(bold('Stamp ID: ') + stamp.batchID)
    this.console.log(bold('Usage: ') + stamp.usageText)
    this.console.verbose(bold('Depth: ') + stamp.depth)
    this.console.verbose(bold('Bucket depth: ') + stamp.bucketDepth)
    this.console.verbose(bold('Amount: ') + stamp.amount)
    this.console.verbose(bold('Usable: ') + stamp.usable)
    this.console.verbose(bold('Utilization: ') + stamp.utilization)
    this.console.verbose(bold('Block Number: ') + stamp.blockNumber)
    this.console.verbose(bold('Immutable Flag: ') + stamp.immutableFlag)
    this.console.quiet(stamp.batchID + ' ' + stamp.usageText)
  }

  protected printBatchId(batchId: string): void {
    this.console.log(bold('Stamp ID: ') + batchId)
    this.console.quiet(batchId)
  }
}
