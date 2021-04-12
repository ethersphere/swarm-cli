import { existsSync, unlinkSync } from 'fs'
import { cli } from 'furious-commander'
import { Server } from 'http'
import { bold, green } from 'kleur'
import { join } from 'path'
import { optionParameters, rootCommandClasses } from '../../src/config'
import { createChequeMockHttpServer } from '../http-mock/cheque-mock'

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
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['cheque', 'list', '--bee-debug-api-url', 'http://localhost:16737'],
    })
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
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['cheque', 'list', '--bee-debug-api-url', 'http://localhost:1377'],
    })
    const length = consoleMessages.length
    expect(consoleMessages[length - 1]).toBe(bold('Cheque Value: ') + '8944000000000')
  })

  it('should print balance', async () => {
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['cheque', 'balance', '--bee-debug-api-url', 'http://localhost:1377'],
    })
    const length = consoleMessages.length
    expect(consoleMessages[length - 2]).toBe(bold('Total: ') + '100026853000000000')
    expect(consoleMessages[length - 1]).toBe(bold('Available: ') + '100018560000000000')
  })

  it('should cashout', async () => {
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['cheque', 'cashout', '--all', '--bee-debug-api-url', 'http://localhost:1377'],
    })
    const length = consoleMessages.length
    expect(consoleMessages[length - 3]).toBe(
      bold('Peer Address: ') + '1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad',
    )
    expect(consoleMessages[length - 2]).toBe(bold('Cheque Value: ') + '8944000000000')
    expect(consoleMessages[length - 1]).toBe(
      green(bold('Tx:           ')) + '0x11df9811dc8caaa1ff4389503f2493a8c46b30c0a0b5f8aa54adbb965374c0ae',
    )
  })
})
