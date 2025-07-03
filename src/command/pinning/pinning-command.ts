import { exit } from 'process'
import { RootCommand } from '../root-command'

export class PinningCommand extends RootCommand {
  protected async init(): Promise<void> {
    super.init()

    if (await this.bee.isGateway()) {
      this.console.error('Pinning is currently not supported on the gateway node.')
      this.console.error('You can use the pinning API with your local Bee node.')

      exit(1)
    }
  }
}
