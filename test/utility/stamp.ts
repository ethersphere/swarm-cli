/* eslint-disable no-console */
import { BeeDebug } from '@ethersphere/bee-js'

const DEFAULT_BEE_DEBUG = 'http://localhost:1635'

export const getOrBuyStamp = async (): Promise<string> => {
  const beeDebug = new BeeDebug(DEFAULT_BEE_DEBUG)

  const availableStamps = await beeDebug.getAllPostageBatch()

  if (availableStamps.length > 0) {
    const usedStamp = availableStamps[0].batchID
    console.log('Using existing stamp: ', usedStamp)

    return usedStamp
  }

  console.log('Buying new stamp.')
  const newStamp = await beeDebug.createPostageBatch('1000000', 20, { waitForUsable: true })
  console.log('Bought stamp: ', newStamp)

  return newStamp
}

export const getStampOption = (): string[] => ['--stamp', process.env.STAMP || '']
