import { Argument, LeafCommand } from 'furious-commander'
import { PinningCommand } from './pinning-command'

export class Unpin extends PinningCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'unpin'

  public readonly description = 'Unpin a collection or feed'

  @Argument({ key: 'address', description: 'Reference of the collection or feed', required: true })
  public address!: string

  public async run(): Promise<void> {
    super.init()

    try {
      await this.bee.unpin(this.address)
      this.console.log('Unpinned successfully')
    } catch (error) {
      this.console.error('Could not unpin ' + this.address)
      this.console.printBeeError(error, { notFoundMessage: 'No pinned chunk found with that address.' })
    }
  }
}
