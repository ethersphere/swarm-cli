import chalk from 'chalk'
import { LeafCommand } from 'furious-commander'
import { profileConfig } from '../../profile'
import { RootCommand } from '../root-command'

export class List extends RootCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly description = 'List profiles'

  public async run(): Promise<void> {
    await super.init()

    const { active } = profileConfig

    for (const key of Object.keys(profileConfig.profiles)) {
      if (key === active) {
        this.console.log(chalk.green.bold(key) + ' (active)')
      } else {
        this.console.log(key)
      }
    }
  }
}
