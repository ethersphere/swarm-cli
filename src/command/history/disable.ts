import { LeafCommand } from 'furious-commander'
import { HistoryCommand } from './history-command'
import { warningText } from '../../utils/text'
import { existsSync, unlinkSync } from 'fs'

export class Disable extends HistoryCommand implements LeafCommand {
  public readonly name = 'disable'

  public readonly description = 'Disable upload history tracking'

  public async run() {
    super.init()

    const historyFileExists = existsSync(this.commandConfig.getHistoryFilePath())

    if (!this.commandConfig.config.historyEnabled && !historyFileExists) {
      this.console.log(warningText('Upload history tracking is already disabled and no history file exists'))

      return
    }

    if (!this.quiet && !this.yes && historyFileExists) {
      this.yes = await this.console.confirm(
        'Do you want to delete the upload history file? This action cannot be undone.',
      )
    }

    if (this.yes && historyFileExists) {
      unlinkSync(this.commandConfig.getHistoryFilePath())
      this.console.log('Upload history file deleted')
    }

    this.commandConfig.setHistoryEnabled(false)
    this.console.log('Upload history tracking disabled')
  }
}
