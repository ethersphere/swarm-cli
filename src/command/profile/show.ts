import { Argument, LeafCommand } from 'furious-commander'
import { profileConfig } from '../../profile'
import { ProfileCommand } from './profile-command'

export class Show extends ProfileCommand implements LeafCommand {
  public readonly name = 'show'

  public readonly description = 'Show profile details'

  @Argument({ key: 'name', description: 'Name of the profile', required: true })
  public profileName!: string

  public async run(): Promise<void> {
    await super.init()

    const profile = profileConfig.get(this.profileName)
    this.print(profile)
  }
}
