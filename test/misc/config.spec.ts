import { writeFileSync } from 'fs'
import { join } from 'path'
import { invokeTestCli } from '../utility'

describe('Test configuration loading', () => {
  let consoleMessages: string[] = []

  const configFolderPath = join(__dirname, '..', 'testconfig')
  const configFileName = 'config.config.json'
  const configFilePath = join(configFolderPath, configFileName)

  beforeAll(() => {
    global.console.log = jest.fn(message => {
      consoleMessages.push(message)
    })
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

    await invokeTestCli(['cheque', 'list'])
    expect(consoleMessages[0]).toContain('http://localhost:30003')
  })

  it('should use env over config when specified', async () => {
    process.env.BEE_DEBUG_API_URL = 'http://localhost:30002'

    await invokeTestCli(['cheque', 'list'])
    expect(consoleMessages[0]).toContain('http://localhost:30002')
  })

  it('should use explicit option over all', async () => {
    await invokeTestCli(['cheque', 'list', '--bee-debug-api-url', 'http://localhost:30001'])
    expect(consoleMessages[0]).toContain('http://localhost:30001')
  })

  it('should read config path explicitly, then use it for url', async () => {
    delete process.env.BEE_DEBUG_API_URL

    writeFileSync(
      join(configFolderPath, 'config2.config.json'),
      JSON.stringify({
        beeDebugApiUrl: 'http://localhost:30004',
      }),
    )

    await invokeTestCli(['cheque', 'list', '--config-file', 'config2.config.json'])
    expect(consoleMessages[0]).toContain('http://localhost:30004')
  })
})
