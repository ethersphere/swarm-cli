import { LeafCommand } from 'furious-commander'
import { HistoryCommand } from './history-command'
import { warningText } from '../../utils/text'
import { writeFileSync } from 'fs'

export class Enable extends HistoryCommand implements LeafCommand {
  public readonly name = 'enable'

  public readonly description = 'Enable upload history tracking'

  public run() {
    super.init()

    if (this.commandConfig.config.historyEnabled) {
      this.console.log(warningText('Upload history tracking is already enabled'))

      return
    }
    this.commandConfig.setHistoryEnabled(true)
    writeFileSync(this.commandConfig.getHistoryFilePath(), JSON.stringify([]))
    this.console.log('Upload history tracking enabled')
  }
}
