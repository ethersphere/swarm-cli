import { existsSync, readFileSync, writeFileSync } from 'fs'
import { exit } from 'process'
import { CommandConfig } from '../../command/root-command/command-config'
import { CommandLog } from '../../command/root-command/command-log'
import { AccessHistoryEvent, AccessHistoryEventType, AccessHistoryLog } from './types/history-event'

export class AccessHistory {
  private commandConfig: CommandConfig
  private console: CommandLog

  constructor(commandConfig: CommandConfig, console: CommandLog) {
    this.commandConfig = commandConfig
    this.console = console
  }

  public getHistory(): AccessHistoryLog {
    const historyFilePath = this.commandConfig.getAccessHistoryFilePath()

    if (!existsSync(historyFilePath)) {
      return {}
    }
    const historyData = readFileSync(historyFilePath)
    try {
      const historyLog = JSON.parse(historyData.toString()) as AccessHistoryLog

      return historyLog
    } catch (err) {
      this.console.error(`There has been an error parsing access history JSON from path: '${historyFilePath}'`)

      exit(1)
    }
  }

  public getEventsByType(granteeListName: string, eventType: AccessHistoryEventType): AccessHistoryEvent[] {
    const history = this.getHistory()

    if (!history[granteeListName]) {
      return []
    }

    return history[granteeListName].filter(event => event.type === eventType)
  }

  public addEvent(granteeListName: string, event: AccessHistoryEvent) {
    const history = this.getHistory()

    if (!history[granteeListName]) {
      history[granteeListName] = []
    }

    history[granteeListName].push({
      timestamp: event.timestamp,
      reference: event.reference,
      historyAddress: event.historyAddress,
      stamp: event.stamp,
      type: event.type,
    })

    writeFileSync(this.commandConfig.getAccessHistoryFilePath(), JSON.stringify(history))
  }
}
