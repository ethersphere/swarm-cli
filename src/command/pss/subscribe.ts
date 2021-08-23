import { BeeError } from '@ethersphere/bee-js'
import { createWriteStream } from 'fs'
import { LeafCommand, Option } from 'furious-commander'
import { PssCommand } from './pss-command'

export class Subscribe extends PssCommand implements LeafCommand {
  public readonly name = 'subscribe'

  public readonly description = 'Subscribe to messages with Postal Service for Swarm'

  @Option({
    key: 'out-file',
    alias: 'o',
    description: 'Write received data to file',
  })
  public outFile!: string

  public async run(): Promise<void> {
    await super.init()

    this.console.log('Subscribing for PSS messages on topic ' + this.topic)

    const stream = this.outFile ? createWriteStream(this.outFile) : null

    this.bee.pssSubscribe(this.topic, {
      onMessage: data => {
        if (stream) {
          stream.write(data)
        } else {
          this.console.log(data.text())
          this.console.quiet(data.text())
        }
      },
      onError: (error: BeeError) => {
        this.console.error(error.message)
      },
    })
  }
}
