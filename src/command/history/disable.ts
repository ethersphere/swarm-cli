import { LeafCommand } from 'furious-commander'
import { HistoryCommand } from './history-command'
import { warningText } from '../../utils/text'

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
        'Are you sure you want to disable upload history tracking? This will delete the upload history file and all upload history data will be lost.',
      )
    }

    if (!this.yes) return

    this.commandConfig.disableHistory()
    this.console.log('Upload history file deleted and upload history tracking disabled')
  }
}
