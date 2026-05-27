export enum AccessHistoryOperation {
  Init = 'init',
  Add = 'add',
  Revoke = 'revoke',
}

export type AccessHistoryEvent = {
  stampId: string
  historyAddress: string
  granteeListRef: string
  operation: AccessHistoryOperation
  createdAt: number
}

export type AccessHistoryLog = { [name: string]: AccessHistoryEvent[] }
