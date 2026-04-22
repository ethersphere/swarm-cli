import { LeafCommand } from 'furious-commander'
import { HistoryCommand } from './history-command'
import chalk from 'chalk'
import { existsSync, statSync } from 'fs'

export class Status extends HistoryCommand implements LeafCommand {
  public readonly name = 'status'

  public readonly alias = 'st'

  public readonly description = 'Check if upload history tracking is enabled'

  public run() {
    super.init()

    const statusText = this.commandConfig.config.historyEnabled ? chalk.green('active') : chalk.yellow('inactive')
    this.console.log(chalk.green.bold('Upload history tracking status:'))
    this.console.log(`Status: ${statusText}`)

    if (this.commandConfig.config.historyEnabled) {
      this.console.log(`History file path: ${this.commandConfig.getHistoryFilePath()}`)
      let size = 0

      if (existsSync(this.commandConfig.getHistoryFilePath())) {
        size = statSync(this.commandConfig.getHistoryFilePath()).size
      }
      this.console.log(`History file size: ${size} bytes`)
    }
  }
}
