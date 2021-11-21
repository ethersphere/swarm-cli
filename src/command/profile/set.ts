import { LeafCommand, Option } from 'furious-commander'
import { profileConfig } from '../../profile'
import { RootCommand } from '../root-command'

export class Set extends RootCommand implements LeafCommand {
  public readonly name = 'set'

  public readonly description = 'Set a command option or global option in a profile'

  @Option({ key: 'profile', description: 'Profile to configure, or active profile if not specified' })
  public profile!: string

  @Option({ key: 'command', description: 'Full command (e.g. "feed upload")', required: true, conflicts: 'global' })
  public command!: string

  @Option({ key: 'option', description: 'Key of the option', required: true })
  public option!: string

  @Option({ key: 'value', description: 'Default value of the option', required: true })
  public value!: string

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
      profileConfig.set(profile, 'globalOptions', this.option, this.value)
    } else {
      profileConfig.set(profile, this.command, this.option, this.value)
    }
  }
}
