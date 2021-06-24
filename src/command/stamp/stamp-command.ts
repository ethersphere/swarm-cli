import { bold } from 'kleur'
import { RootCommand } from '../root-command'

export class StampCommand extends RootCommand {
  protected printBatchId(batchId: string): void {
    this.console.log(bold('Stamp ID: ') + batchId)
    this.console.quiet(batchId)
  }
}
