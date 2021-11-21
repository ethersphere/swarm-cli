import { Argument, LeafCommand } from 'furious-commander'
import { profileConfig } from '../../profile'
import { RootCommand } from '../root-command'

export class Rename extends RootCommand implements LeafCommand {
  public readonly name = 'rename'

  public readonly description = 'Rename an existing profile'

  @Argument({ key: 'old-name', description: 'Old name of the profile', required: true })
  public oldName!: string

  @Argument({ key: 'new-name', description: 'New name of the profile', required: true })
  public newName!: string

  public async run(): Promise<void> {
    await super.init()

    profileConfig.rename(this.oldName, this.newName)
  }
}
