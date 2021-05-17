import { cli } from 'furious-commander'
import { Buy } from '../../src/command/stamp/buy'
import { optionParameters, rootCommandClasses } from '../../src/config'

export const buyStamp = async (): Promise<string> => {
  const execution = await cli({
    rootCommandClasses,
    optionParameters,
    testArguments: ['stamp', 'buy', '--depth', '20', '--amount', '1'],
  })
  const command = execution.runnable as Buy

  return command.postageBatchId
}

export const getStampOption = (): string[] => ['--stamp', process.env.STAMP || '']
