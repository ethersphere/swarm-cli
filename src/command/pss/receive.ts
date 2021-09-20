import { createWriteStream } from 'fs'
import { LeafCommand, Option } from 'furious-commander'
import { getFieldOrNull } from '../../utils'
import { PssCommand } from './pss-command'

export class Receive extends PssCommand implements LeafCommand {
  public readonly name = 'receive'

  public readonly description = 'Receive message with Postal Service for Swarm'

  @Option({
    key: 'timeout',
    description: 'Timeout in milliseconds',
    type: 'number',
  })
  public timeout!: number

  @Option({
    key: 'out-file',
    alias: 'o',
    description: 'Write received data to file',
  })
  public outFile!: string

  /**
   * Used for testing. Received message is stored here so assertions can be made.
   */
  public receivedMessage?: string

  public async run(): Promise<void> {
    await super.init()

    this.console.log('Waiting for one PSS message on topic ' + this.topic)

    const stream = this.outFile ? createWriteStream(this.outFile, { encoding: 'binary' }) : null

    try {
      const data = await this.bee.pssReceive(this.topic, this.timeout)

      this.receivedMessage = data.text()

      if (stream) {
        stream.write(data)
      } else {
        // TODO: utf-8 decoding may fail, text is probably not the best choice here
        this.console.log(this.receivedMessage)
        this.console.quiet(this.receivedMessage)
      }
    } catch (error) {
      if (getFieldOrNull(error, 'message') === 'pssReceive timeout') {
        this.console.error('Receive timed out')
      } else {
        this.console.printBeeError(error)
      }
    }
  }
}
