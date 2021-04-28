import { Argument, LeafCommand } from 'furious-commander'
import { RootCommand } from '../root-command'

export class Unpin extends RootCommand implements LeafCommand {
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
      if (error.message === 'Internal Server Error') {
        this.console.error('Could not unpin ' + this.address)
        this.console.error('This chunk may not be pinned. Please verify with the command `pinning list`.')
        this.console.error(
          'Unpinning root chunks which were uploaded with --index-document header are currently not supported.',
        )
      } else {
        this.console.error(error.message)
      }
    }
  }
}
