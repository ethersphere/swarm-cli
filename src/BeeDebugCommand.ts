import { BeeDebug } from '@ethersphere/bee-js'
import { RootCommand } from './command/root-command'

export class BeeDebugCommand extends RootCommand {
  public beeDebug!: BeeDebug

  async init(): Promise<void> {
    super.init()
    this.beeDebug = await this.checkAndGetBeeDebug()
  }
}
