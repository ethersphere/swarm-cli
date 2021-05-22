import { cli } from 'furious-commander'
import { optionParameters, rootCommandClasses } from '../../src/config'

export async function invokeTestCli(argv: string[]) {
  const commandBuilder = await cli({
    rootCommandClasses,
    optionParameters,
    testArguments: argv,
  })

  return commandBuilder
}
