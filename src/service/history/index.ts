import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { HistoryItem } from './types/historyItem'
import { exit } from 'process'
import { CommandLog } from '../../command/root-command/command-log'

export class History {
  public configFolderPath: string
  private console: CommandLog

  constructor(configFolderPath: string, console: CommandLog) {
    this.configFolderPath = configFolderPath
    this.console = console
  }

  public getHistoryFilePath(): string {
    return process.env.SWARM_CLI_HISTORY_FILE_PATH ?? join(this.configFolderPath, 'upload-history.json')
  }
  public getItems(): HistoryItem[] {
    const historyFilePath = this.getHistoryFilePath()

    if (!existsSync(historyFilePath)) {
      return []
    }
    const historyData = readFileSync(historyFilePath)
    try {
      const historyList = JSON.parse(historyData.toString()) as HistoryItem[]

      return historyList
    } catch (err) {
      this.console.error(`There has been an error parsing history JSON from path: '${historyFilePath}'`)

      exit(1)
    }
  }

  public addItem(item: HistoryItem) {
    const history = this.getItems()
    item.index = history.length + 1
    history.push(item)
    writeFileSync(this.getHistoryFilePath(), JSON.stringify(history))
  }
}
