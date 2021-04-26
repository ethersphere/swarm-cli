import { Argument, LeafCommand } from 'furious-commander'
import { RootCommand } from '../root-command'

export class Pin extends RootCommand implements LeafCommand {
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
      this.console.error(error.message)
    }
  }
}
