import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { HistoryItem } from './types/history-item'
import { exit } from 'process'
import { CommandLog } from '../../command/root-command/command-log'

export class History {
  public configFolderPath: string
  private console: CommandLog

  constructor(configFolderPath: string, console: CommandLog) {
    this.configFolderPath = configFolderPath
    this.console = console
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

  public getItemByIndex(index: number): HistoryItem | undefined {
    return this.getItems().find((item: HistoryItem) => item.index === index)
  }

  public addItem(item: HistoryItem) {
    const history = this.getItems()
    item.index = history.length + 1
    history.push(item)
    writeFileSync(this.getHistoryFilePath(), JSON.stringify(history))
  }

  public getHistoryFilePath(): string {
    return join(this.configFolderPath, 'upload-history.json')
  }
}
