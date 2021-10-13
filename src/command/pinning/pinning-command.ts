import { exit } from 'process'
import { isGateway } from '../../utils'
import { RootCommand } from '../root-command'

export class PinningCommand extends RootCommand {
  protected async init(): Promise<void> {
    await super.init()

    if (isGateway(this.beeApiUrl)) {
      this.console.error('Pinning is currently not supported on the gateway node.')
      this.console.error('You can use the pinning API with your local Bee node.')

      exit(1)
    }
  }
}
