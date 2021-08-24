import { DebugPostageBatch } from '@ethersphere/bee-js'

export interface EnrichedStamp extends DebugPostageBatch {
  usage: number
  usageNormal: number
  usageText: string
}
