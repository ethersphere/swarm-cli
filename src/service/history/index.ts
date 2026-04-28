import { existsSync, readFileSync, writeFileSync } from 'fs'
import { HistoryItem } from './types/history-item'
import { exit } from 'process'
import { CommandLog } from '../../command/root-command/command-log'
import { CommandConfig } from '../../command/root-command/command-config'

export class History {
  private commandConfig: CommandConfig
  private console: CommandLog

  constructor(commandConfig: CommandConfig, console: CommandLog) {
    this.commandConfig = commandConfig
    this.console = console
  }

  public getItems(): HistoryItem[] {
    const historyFilePath = this.commandConfig.getHistoryFilePath()

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
    writeFileSync(this.commandConfig.getHistoryFilePath(), JSON.stringify(history))
  }
}
