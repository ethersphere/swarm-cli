import { PostageBatch } from '@ethersphere/bee-js'

export interface EnrichedStamp extends PostageBatch {
  usage: number
  usageNormal: number
  usageText: string
}
