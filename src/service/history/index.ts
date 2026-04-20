import { existsSync, readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { History } from './types/history'
import { exit } from 'process'
import { CommandLog } from '../../command/root-command/command-log'

const historyFilePath = join(homedir(), '.swarm-upload-history.json')

export function getHistory(console: CommandLog): History[] {
  if (!existsSync(historyFilePath)) {
    return []
  }
  const historyData = readFileSync(historyFilePath)
  try {
    const historyList = JSON.parse(historyData.toString()) as History[]

    return historyList
  } catch (err) {
    console.error(`There has been an error parsing history JSON from path: '${historyFilePath}'`)

    exit(1)
  }
}

export function saveHistory(historyEntry: History, console: CommandLog) {
  const history = getHistory(console)
  historyEntry.index = history.length + 1
  history.push(historyEntry)
  writeFileSync(historyFilePath, JSON.stringify(history))
}
