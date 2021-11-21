import { LeafCommand, Option } from 'furious-commander'
import { profileConfig } from '../../profile'
import { RootCommand } from '../root-command'

export class Unset extends RootCommand implements LeafCommand {
  public readonly name = 'unset'

  public readonly description = 'Unset a command option or global option in a profile'

  @Option({ key: 'profile', description: 'Profile to configure, or active profile if not specified' })
  public profile!: string

  @Option({ key: 'command', description: 'Full command (e.g. "feed upload")', required: true, conflicts: 'global' })
  public command!: string

  @Option({ key: 'option', description: 'Key of the option', required: true })
  public option!: string

  @Option({
    key: 'global',
    description: 'Interpret for global option',
    conflicts: 'command',
    type: 'boolean',
    required: true,
  })
  public global!: boolean

  public async run(): Promise<void> {
    await super.init()

    const profile = this.profile || profileConfig.active

    if (!profile) {
      throw Error('Profile must be specified when there is no active profile')
    }

    if (this.global) {
      profileConfig.unset(profile, 'globalOptions', this.option)
    } else {
      profileConfig.unset(profile, this.command, this.option)
    }
  }
}
