export enum AccessHistoryOperation {
  Init = 'init',
  Grant = 'grant',
  Revoke = 'revoke',
}

export type AccessHistoryEvent = {
  stampId: string
  historyAddress: string
  granteeListRef: string
  operation: AccessHistoryOperation
  createdAt: number
  grantees?: string[]
}

export type AccessHistoryLog = { [name: string]: AccessHistoryEvent[] }
