import { Argument, LeafCommand } from 'furious-commander'
import { profileConfig } from '../../profile'
import { RootCommand } from '../root-command'

export class Switch extends RootCommand implements LeafCommand {
  public readonly name = 'switch'

  public readonly description = 'Switch to a profile'

  @Argument({ key: 'name', description: 'Name of the profile', required: true })
  public profileName!: string

  public async run(): Promise<void> {
    await super.init()

    profileConfig.switch(this.profileName)
  }
}
