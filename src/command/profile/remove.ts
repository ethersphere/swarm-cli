import { Argument, LeafCommand } from 'furious-commander'
import { profileConfig } from '../../profile'
import { RootCommand } from '../root-command'

export class Remove extends RootCommand implements LeafCommand {
  public readonly name = 'remove'

  public readonly description = 'Remove an existing profile'

  @Argument({ key: 'name', description: 'Name of the profile', required: true })
  public profileName!: string

  public async run(): Promise<void> {
    await super.init()

    profileConfig.remove(this.profileName)
  }
}
