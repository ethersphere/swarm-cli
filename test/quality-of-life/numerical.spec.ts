import { join } from 'path'
import { invokeTestCli } from '../utility'

describe('Specifying Large Numbers', () => {
  const configFolderPath = join(__dirname, '..', 'testconfig')
  const configFileName = 'numerical.config.json'
  const consoleMessages: string[] = []

  global.console.log = jest.fn(message => {
    consoleMessages.push(message)
  })
  process.env.SWARM_CLI_CONFIG_FOLDER = configFolderPath
  process.env.SWARM_CLI_CONFIG_FILE = configFileName

  beforeEach(() => {
    consoleMessages.length = 0
  })

  it('should be possible with underscores and units', async () => {
    await invokeTestCli(['stamp', 'buy', '--amount', '1_000K', '--depth', '16', '--gas-price', '10_000'])
    expect(consoleMessages[consoleMessages.length - 1]).toContain('Stamp ID:')
  })
})
