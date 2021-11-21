import { Argument, LeafCommand } from 'furious-commander'
import { profileConfig } from '../../profile'
import { RootCommand } from '../root-command'

export class Create extends RootCommand implements LeafCommand {
  public readonly name = 'create'

  public readonly description = 'Create a new profile'

  @Argument({ key: 'name', description: 'Name of the profile', required: true })
  public profileName!: string

  public async run(): Promise<void> {
    await super.init()

    profileConfig.create(this.profileName)
  }
}
