import { BeeError } from '@ethersphere/bee-js'
import { LeafCommand } from 'furious-commander'
import { PssCommand } from './pss-command'

export class Subscribe extends PssCommand implements LeafCommand {
  public readonly name = 'subscribe'

  public readonly description = 'Subscribe to messages with Postal Service for Swarm'

  public run(): void {
    super.init()

    this.bee.pssSubscribe(this.topic, {
      onMessage: data => {
        this.console.log(data.text())
      },
      onError: (error: BeeError) => {
        this.console.error(error.message)
      },
    })
  }
}
