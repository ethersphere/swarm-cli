import { invokeTestCli } from '.'
import { Buy } from '../../src/command/stamp/buy'

export const buyStamp = async (beeApiUrl = 'http://localhost:1633'): Promise<string> => {
  const execution = await invokeTestCli(['stamp', 'buy', '--depth', '20', '--amount', '1', '--bee-api-url', beeApiUrl])
  const command = execution.runnable as Buy

  return command.postageBatchId
}

export const getStampOption = (peer = false): string[] => [
  '--stamp',
  (peer ? process.env.PEER_STAMP : process.env.STAMP) || '',
]
