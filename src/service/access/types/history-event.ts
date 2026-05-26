export enum AccessHistoryEventType {
  Init = 'init',
  Add = 'add',
  Revoke = 'revoke',
}

export type AccessHistoryEvent = {
  reference: string
  stamp: string
  historyAddress: string
  type: AccessHistoryEventType
  timestamp: number
}

export type AccessHistoryLog = { [name: string]: AccessHistoryEvent[] }
