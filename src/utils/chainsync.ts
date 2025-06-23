import { Bee } from '@upcoming/bee-js'

const THRESHOLD = 10_000

export async function isChainStateReady(bee: Bee): Promise<boolean> {
  const chainState = await bee.getChainState()

  return chainState.chainTip > chainState.block - THRESHOLD
}
