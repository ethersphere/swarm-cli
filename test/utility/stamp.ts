/* eslint-disable no-console */
import { Bee } from '@ethersphere/bee-js'

export const getOrBuyStamp = async (): Promise<string> => {
  const bee = new Bee('http://localhost:1633')
  const availableStamps = await bee.getAllPostageBatch()

  if (availableStamps.length > 0) {
    const usedStamp = availableStamps[0].batchID
    console.log('Using existing stamp: ', usedStamp)

    return usedStamp
  }

  console.log('Buying new stamp.')
  const newStamp = await bee.createPostageBatch('500000000', 20, { waitForUsable: true })
  console.log('Bought stamp: ', newStamp)

  return newStamp
}

export const getStampOption = (): string[] => ['--stamp', process.env.STAMP || '']
