import { existsSync, unlinkSync } from 'fs'
import { Server } from 'http'
import { bold, green } from 'kleur'
import { join } from 'path'
import { createChequeMockHttpServer } from '../http-mock/cheque-mock'
import { invokeTestCli } from '../utility'

async function runCommandAndExpectError(
  argv: string[],
  errorPattern: string,
  consoleMessages: string[],
): Promise<void> {
  await invokeTestCli(argv)
  const lastConsoleMessage = consoleMessages[consoleMessages.length - 1]
  expect(lastConsoleMessage).toContain(errorPattern)
}

describe('Test Cheque command', () => {
  const configFolderPath = join(__dirname, '..', 'testconfig')
  const configFileName = 'cheque.config.json'
  const configFilePath = join(configFolderPath, configFileName)
  let consoleMessages: string[] = []
  let server: Server

  beforeAll(() => {
    server = createChequeMockHttpServer(1377)
    global.console.log = jest.fn(message => {
      consoleMessages.push(message)
    })
    global.console.error = jest.fn(message => {
      consoleMessages.push(message)
    })
    jest.spyOn(global.console, 'warn')
    //set config environment variable
    process.env.SWARM_CLI_CONFIG_FOLDER = configFolderPath
    process.env.SWARM_CLI_CONFIG_FILE = configFileName

    //remove config file if it exists
    if (existsSync(configFilePath)) unlinkSync(configFilePath)
  })

  afterAll(() => {
    server.close()
  })

  beforeEach(() => {
    //clear stored console messages
    consoleMessages = []
  })

  it('should print helpful error message when api is unavailable', async () => {
    process.env.BEE_DEBUG_API_URL = 'http://localhost:16737'
    await invokeTestCli(['cheque', 'list'])
    const length = consoleMessages.length
    expect(consoleMessages[length - 3]).toBe(
      bold().white().bgRed('Could not reach Debug API at http://localhost:16737'),
    )
    expect(consoleMessages[length - 2]).toBe(
      bold().white().bgRed('Make sure you have the Debug API enabled in your Bee config'),
    )
    expect(consoleMessages[length - 1]).toBe(
      bold().white().bgRed('or correct the URL with the --bee-debug-api-url option.'),
    )
  })

  it('should print cheques', async () => {
    process.env.BEE_DEBUG_API_URL = 'http://localhost:1377'
    await invokeTestCli(['cheque', 'list'])
    const length = consoleMessages.length
    expect(consoleMessages[length - 1]).toBe(bold('Cheque Value: ') + '8944000000000 PLUR')
  })

  it('should not print cheques when --minimum is higher', async () => {
    process.env.BEE_DEBUG_API_URL = 'http://localhost:1377'
    await invokeTestCli(['cheque', 'list', '--minimum', '10000000000000000000'])
    const length = consoleMessages.length
    expect(consoleMessages[length - 1]).toContain('No uncashed cheques found')
  })

  it('should print cheques when --minimum is lower', async () => {
    process.env.BEE_DEBUG_API_URL = 'http://localhost:1377'
    await invokeTestCli(['cheque', 'list', '--minimum', '1000'])
    const length = consoleMessages.length
    expect(consoleMessages[length - 1]).toContain('Cheque Value')
  })

  it('should print balance', async () => {
    process.env.BEE_DEBUG_API_URL = 'http://localhost:1377'
    await invokeTestCli(['cheque', 'balance'])
    const length = consoleMessages.length
    expect(consoleMessages[length - 2]).toBe(bold('Total: ') + '100026853000000000 PLUR')
    expect(consoleMessages[length - 1]).toBe(bold('Available: ') + '100018560000000000 PLUR')
  })

  it('should cashout all cheques', async () => {
    process.env.BEE_DEBUG_API_URL = 'http://localhost:1377'
    await invokeTestCli(['cheque', 'cashout', '--all'])
    const length = consoleMessages.length
    expect(consoleMessages[length - 3]).toBe(
      bold('Peer Address: ') + '1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad',
    )
    expect(consoleMessages[length - 2]).toBe(bold('Cheque Value: ') + '8944000000000 PLUR')
    expect(consoleMessages[length - 1]).toBe(
      green(bold('Tx:           ')) + '0x11df9811dc8caaa1ff4389503f2493a8c46b30c0a0b5f8aa54adbb965374c0ae',
    )
  })

  it('should not cashout any cheques when --minimum is higher', async () => {
    process.env.BEE_DEBUG_API_URL = 'http://localhost:1377'
    await invokeTestCli(['cheque', 'cashout', '--all', '--minimum', '10000000000000000000'])
    const length = consoleMessages.length
    expect(consoleMessages[length - 1]).toContain('Found 0 cheques')
  })

  it('should cashout one specific cheque', async () => {
    process.env.BEE_DEBUG_API_URL = 'http://localhost:1377'
    await invokeTestCli([
      'cheque',
      'cashout',
      '--peer',
      '1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad',
    ])
    const length = consoleMessages.length
    expect(consoleMessages[length - 3]).toBe(
      bold('Peer Address: ') + '1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad',
    )
    expect(consoleMessages[length - 2]).toBe(bold('Cheque Value: ') + '8944000000000 PLUR')
    expect(consoleMessages[length - 1]).toBe(
      green(bold('Tx:           ')) + '0x11df9811dc8caaa1ff4389503f2493a8c46b30c0a0b5f8aa54adbb965374c0ae',
    )
  })

  it('should raise error when withdrawing negative amount', async () => {
    await runCommandAndExpectError(['cheque', 'withdraw', '-1'], '[amount] must be at least 1', consoleMessages)
  })

  it('should raise error when depositing negative amount', async () => {
    await runCommandAndExpectError(['cheque', 'deposit', '-42000000'], '[amount] must be at least 1', consoleMessages)
  })

  it('should raise error when withdrawing zero', async () => {
    await runCommandAndExpectError(['cheque', 'withdraw', '0'], '[amount] must be at least 1', consoleMessages)
  })

  it('should raise error when depositing zero', async () => {
    await runCommandAndExpectError(['cheque', 'deposit', '0'], '[amount] must be at least 1', consoleMessages)
  })
})
