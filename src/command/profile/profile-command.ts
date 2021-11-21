import chalk from 'chalk'
import { Profile } from '../../profile/profile-config'
import { RootCommand } from '../root-command'

export class ProfileCommand extends RootCommand {
  protected print(profile: Profile): void {
    if (profile.globalOptions) {
      this.console.log(chalk.green.bold.underline('Global Options'))
      for (const [key, value] of Object.entries(profile.globalOptions)) {
        this.console.log(`${key}: ${value}`)
      }
    }
    for (const command of Object.keys(profile)) {
      if (command === 'globalOptions') {
        continue
      }
      this.console.log('')
      this.console.log(chalk.bold.underline(command))
      for (const [key, value] of Object.entries(profile[command])) {
        this.console.log(`${key}: ${value}`)
      }
    }
  }
}
