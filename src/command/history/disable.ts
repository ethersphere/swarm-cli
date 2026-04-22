import { LeafCommand } from 'furious-commander'
import { HistoryCommand } from './history-command'
import { warningText } from '../../utils/text'

export class Disable extends HistoryCommand implements LeafCommand {
  public readonly name = 'disable'

  public readonly description = 'Disable upload history tracking'

  public async run() {
    super.init()

    if (!this.commandConfig.config.historyEnabled) {
      this.console.log(warningText('Upload history tracking is not enabled'))

      return
    }
    await this.console.confirm(
      'Are you sure you want to disable upload history tracking? This will delete the upload history file and all upload history data will be lost.',
    )
    this.commandConfig.disableHistory()
    this.console.log('Upload histtory file deleted and upload history tracking disabled')
  }
}
