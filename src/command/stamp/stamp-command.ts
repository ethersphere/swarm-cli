import { StampBatch } from '@ethersphere/bee-js'
import { bold } from 'kleur'
import { RootCommand } from '../root-command'

export class StampCommand extends RootCommand {
  protected printStamp(stamp: StampBatch): void {
    this.console.divider('-')
    this.console.log(bold('Stamp ID: ') + stamp.batchID)
    this.console.log(bold('Utilization: ') + stamp.utilization)
    this.console.quiet(stamp.batchID + ' ' + stamp.utilization)
  }

  protected printBatchId(batchId: string): void {
    this.console.log(bold('Stamp ID: ') + batchId)
    this.console.quiet(batchId)
  }
}
