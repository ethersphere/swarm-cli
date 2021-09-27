import { Argument, LeafCommand } from 'furious-commander'
import { PinningCommand } from './pinning-command'

export class Pin extends PinningCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'pin'

  public readonly description = 'Pin a collection or feed'

  @Argument({ key: 'address', description: 'Reference of the collection or feed', required: true })
  public address!: string

  public async run(): Promise<void> {
    await super.init()

    try {
      await this.bee.pin(this.address)
      this.console.log('Pinned successfully')
    } catch (error) {
      this.console.printBeeError(error, { notFoundMessage: `No root chunk found with address ${this.address}` })
    }
  }
}
