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
      await this.bee.unpinCollection(this.address)
      this.console.log('Unpinned successfully')
    } catch (error) {
      this.console.error('Could not unpin ' + this.address)

      if (error.message === 'Bad Request') {
        this.console.error('Only root chunks can be unpinned.')
      } else if (error.message === 'Not Found') {
        this.console.error('No pinned chunk found with that address.')
      } else {
        this.console.error(error.message)
      }
    }
  }
}
