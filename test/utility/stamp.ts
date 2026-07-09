/* eslint-disable no-console */
import { BatchId, Bee } from '@ethersphere/bee-js'
import { Numbers } from 'cafe-utility'

export const getOrBuyStamp = async (): Promise<BatchId> => {
  const bee = new Bee('http://localhost:1633')
  const availableStamps = await bee.getAllPostageBatch()

  if (availableStamps.length > 0) {
    const usedStamp = availableStamps[0].batchID
    console.log('Using existing stamp: ', usedStamp.toHex())

    return usedStamp
  }

  console.log('Buying new stamp.')
  const newStamp = await bee.createPostageBatch(Numbers.make('2b').toString(), 22, { waitForUsable: true })
  console.log('Bought stamp: ', newStamp.toHex())

  return newStamp
}

export const getStampOption = (): string[] => ['--stamp', process.env.TEST_STAMP || '']

export const getBeeDevOption = (): string[] => ['--bee-api-url', 'http://localhost:16337']
