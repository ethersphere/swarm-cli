import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'

export class StampCommand extends RootCommand {
  protected async printDepthAndAmount(id: string): Promise<void> {
    const stamp = await this.bee.getPostageBatch(id)
    this.console.log(createKeyValue('Stamp ID', stamp.batchID.toHex()))
    this.console.log(createKeyValue('Depth', stamp.depth))
    this.console.log(createKeyValue('Amount', stamp.amount))
  }
}
