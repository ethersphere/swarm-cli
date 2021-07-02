import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'

export class StampCommand extends RootCommand {
  protected printBatchId(batchId: string): void {
    this.console.log(createKeyValue('Stamp ID', batchId))
    this.console.quiet(batchId)
  }
}
