import { PostageBatch } from '@ethersphere/bee-js'

export type EnrichedStamp = PostageBatch & { usage: number, usageNormal: number, usageText: string }
