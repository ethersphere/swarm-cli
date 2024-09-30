/* eslint-disable no-console */
import { Bee } from '@ethersphere/bee-js'
import { Numbers } from 'cafe-utility'

export const getOrBuyStamp = async (): Promise<string> => {
  const bee = new Bee('http://localhost:1633')
  const availableStamps = await bee.getAllPostageBatch()

  if (availableStamps.length > 0) {
    const usedStamp = availableStamps[0].batchID
    console.log('Using existing stamp: ', usedStamp)

    return usedStamp
  }

  console.log('Buying new stamp.')
  const newStamp = await bee.createPostageBatch(Numbers.make('2b').toString(), 22, { waitForUsable: true })
  console.log('Bought stamp: ', newStamp)

  return newStamp
}

export const getStampOption = (): string[] => ['--stamp', process.env.TEST_STAMP || '']
