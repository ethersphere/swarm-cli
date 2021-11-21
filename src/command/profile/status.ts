import chalk from 'chalk'
import { LeafCommand } from 'furious-commander'
import { profileConfig } from '../../profile'
import { ProfileCommand } from './profile-command'

export class Status extends ProfileCommand implements LeafCommand {
  public readonly name = 'status'

  public readonly description = 'Show active profile'

  public async run(): Promise<void> {
    await super.init()

    const activeProfile = profileConfig.getActiveProfile()

    if (activeProfile) {
      this.console.log('Active profile: ' + chalk.bold.green(profileConfig.active as string))
      this.console.log('')
      this.print(activeProfile)
    } else {
      this.console.log('No active profile is set')
    }
  }
}
