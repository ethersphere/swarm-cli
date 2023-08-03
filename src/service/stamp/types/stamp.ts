import { PostageBatch } from '@ethersphere/bee-js'
import { Storage } from '../../../utils/storage'

export interface EnrichedStamp extends PostageBatch {
  usage: number
  usageNormal: number
  usageText: string
  capacity: Storage
  remainingCapacity: Storage
}
