import { PostageBatch } from '@upcoming/bee-js'

export interface EnrichedStamp extends PostageBatch {
  usage: number
  usageNormal: number
  usageText: string
  capacity: number
  remainingCapacity: number
}
