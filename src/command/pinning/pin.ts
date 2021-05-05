import { Argument, LeafCommand } from 'furious-commander'
import { PinningCommand } from './pinning-command'

export class Pin extends PinningCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'pin'

  public readonly description = 'Pin a collection or feed'

  @Argument({ key: 'address', description: 'Reference of the collection or feed', required: true })
  public address!: string

  public async run(): Promise<void> {
    super.init()

    try {
      await this.bee.pinCollection(this.address)
      this.console.log('Pinned successfully')
    } catch (error) {
      this.console.error('Could not pin ' + this.address)

      if (error.message === 'Not Found') {
        this.console.error('No root chunk found with that address.')
      } else if (error.message === 'Bad Request') {
        this.console.error('Could not pin that address.')
        this.console.error('Only pinning collections is currently supported.')
      } else if (error.message === 'Internal Server Error') {
        this.console.error(
          'Pinning root chunks which were uploaded with --index-document header are currently not supported.',
        )
      } else {
        this.console.error(error.message)
      }
    }
  }
}
