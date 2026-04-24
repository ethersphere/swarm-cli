import { LeafCommand } from 'furious-commander'
import { HistoryCommand } from './history-command'
import { warningText } from '../../utils/text'
import { existsSync, unlinkSync } from 'fs'

export class Disable extends HistoryCommand implements LeafCommand {
  public readonly name = 'disable'

  public readonly description = 'Disable upload history tracking'

  public async run() {
    super.init()

    if (!this.commandConfig.config.historyEnabled) {
      this.console.log(
        warningText('Upload history tracking is not enabled. Use "swarm-cli history enable" command to enable it.'),
      )

      return
    }

    if (!this.quiet && !this.yes) {
      this.yes = await this.console.confirm(
        'Do you want to delete the upload history file? This action cannot be undone.',
      )
    }

    if (this.yes && existsSync(this.commandConfig.getHistoryFilePath())) {
      process.stdout.write('Deleting upload history file... ')
      unlinkSync(this.commandConfig.getHistoryFilePath())
      this.console.log('Upload history file deleted')
    }

    this.commandConfig.setHistoryEnabled(false)

    this.console.log('Upload history tracking disabled')
  }
}
