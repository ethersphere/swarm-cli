import { invokeTestCli } from '.'
import { Buy } from '../../src/command/stamp/buy'

export const buyStamp = async (): Promise<string> => {
  const execution = await invokeTestCli(['stamp', 'buy', '--depth', '20', '--amount', '1'])
  const command = execution.runnable as Buy

  return command.postageBatchId
}

export const getStampOption = (): string[] => ['--stamp', process.env.STAMP || '']
