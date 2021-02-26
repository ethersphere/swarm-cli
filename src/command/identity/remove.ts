import { Argument, LeafCommand, Option } from 'furious-commander'
import inquirer from 'inquirer'
import { exit } from 'process'
import { promptList } from '../../utils'
import { RootCommand } from '../root-command'
import { printNoIdentitiesError } from './common'

export class Remove extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'remove'

  public readonly description = 'Remove identity'

  @Argument({ key: 'identity-name', describe: 'Name of the designated identity for delete' })
  public identityName!: string

  @Option({ key: 'force', alias: 'f', type: 'boolean', describe: 'Perform action without confirm input prompt' })
  public force!: boolean

  public async run(): Promise<void> {
    this.initCommand()

    if (!this.commandConfig.config.identities) {
      printNoIdentitiesError(this)

      return
    }

    const identityNames = Object.keys(this.commandConfig.config.identities)

    if (!this.identityName) {
      this.identityName = await promptList(identityNames, `Which identity that you would like to delete?`)
    }

    //check identityName does exist
    if (!identityNames.includes(this.identityName)) {
      this.console.error('Given identity name does not exist')

      return
    }

    if (!this.force) {
      const approve = await inquirer.prompt({
        type: 'confirm',
        name: 'question',
        message: `Are you sure you want delete identity '${this.identityName}'?`,
      })

      if (!approve.question) {
        this.console.error('Removal of identity has been cancelled')

        exit(1)
      }
    }

    this.commandConfig.removeIdentity(this.identityName)
    this.console.log('Identity has been successfully removed')
  }

  /** Init additional properties of class, that are not handled by the CLI framework */
  private initCommand(): void {
    super.init()
  }
}
