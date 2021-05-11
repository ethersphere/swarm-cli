import { writeFileSync } from 'fs'
import cli from 'furious-commander'
import { join } from 'path'
import { optionParameters, rootCommandClasses } from '../../src/config'

describe('Test configuration loading', () => {
  let consoleMessages: string[] = []

  const configFolderPath = join(__dirname, '..', 'testconfig')
  const configFileName = 'config.config.json'
  const configFilePath = join(configFolderPath, configFileName)

  beforeAll(() => {
    global.console.log = jest.fn(message => {
      consoleMessages.push(message)
    })
    jest.spyOn(global.console, 'warn')
    //set config environment variable
    process.env.SWARM_CLI_CONFIG_FOLDER = configFolderPath
    process.env.SWARM_CLI_CONFIG_FILE = configFileName
  })

  beforeEach(() => {
    //clear stored console messages
    consoleMessages = []
  })

  it('should use config when env is not specified', async () => {
    writeFileSync(
      configFilePath,
      JSON.stringify({
        beeDebugApiUrl: 'http://localhost:30003',
      }),
    )
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['cheque', 'list'],
    })
    expect(consoleMessages[0]).toContain('http://localhost:30003')
  })

  it('should use env over config when specified', async () => {
    process.env.BEE_DEBUG_API_URL = 'http://localhost:30002'

    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['cheque', 'list'],
    })
    expect(consoleMessages[0]).toContain('http://localhost:30002')
  })

  it('should use explicit option over all', async () => {
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['cheque', 'list', '--bee-debug-api-url', 'http://localhost:30001'],
    })
    expect(consoleMessages[0]).toContain('http://localhost:30001')
  })
})
