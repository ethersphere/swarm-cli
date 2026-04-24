import { LeafCommand } from 'furious-commander'
import { HistoryCommand } from './history-command'
import chalk from 'chalk'
import { existsSync } from 'fs'
import { History } from '../../service/history'

export class Status extends HistoryCommand implements LeafCommand {
  public readonly name = 'status'

  public readonly alias = 'st'

  public readonly description = 'Check if upload history tracking is enabled'

  public run() {
    super.init()

    const statusText = this.commandConfig.config.historyEnabled ? chalk.green('active') : chalk.yellow('inactive')
    this.console.log(chalk.green.bold('Upload history tracking status:'))
    this.console.log(`Status: ${statusText}`)

    if (existsSync(this.commandConfig.getHistoryFilePath())) {
      this.console.log(`History file path: ${this.commandConfig.getHistoryFilePath()}`)

      const history = new History(this.commandConfig, this.console)
      this.console.log(`Number of history entries: ${history.getItems().length}`)
    }
  }
}
