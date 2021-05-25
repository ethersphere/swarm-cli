import { createChequeMockHttpServer } from '../http-mock/cheque-mock'
import { invokeTestCli } from '../utility'

const server = createChequeMockHttpServer(1378)
const consoleMessages: string[] = []

const containsAllSubstrings = (string: string, substrings: string[]): boolean => {
  return substrings.every(substring => string.includes(substring))
}

const substringsPrinted = (substrings: string[]): boolean => {
  return Boolean(consoleMessages.find(message => containsAllSubstrings(message, substrings)))
}

const expectSubstringsPrinted = (...substrings: string[]): void => {
  expect(substringsPrinted(substrings)).toBe(true)
}

describe('Test Monetary units', () => {
  beforeAll(() => {
    global.console.log = jest.fn(message => {
      consoleMessages.push(message)
    })
  })

  beforeEach(() => {
    consoleMessages.length = 0
  })

  afterAll(() => {
    server.close()
  })

  it('should show units in help: stamp buy', async () => {
    await invokeTestCli(['stamp', 'buy', '--help'])
    expectSubstringsPrinted('--amount', 'in PLUR')
    expectSubstringsPrinted('--gas-price', 'in wei')
  })

  it('should show units in help: cheque list', async () => {
    await invokeTestCli(['cheque', 'list', '--help'])
    expectSubstringsPrinted('--minimum', 'in PLUR')
  })

  it('should show units in help: cheque cashout', async () => {
    await invokeTestCli(['cheque', 'cashout', '--help'])
    expectSubstringsPrinted('--minimum', 'in PLUR')
  })

  it('should show units in help: cheque withdraw', async () => {
    await invokeTestCli(['cheque', 'withdraw', '--help'])
    expectSubstringsPrinted('amount', 'in PLUR')
  })

  it('should show units in help: cheque deposit', async () => {
    await invokeTestCli(['cheque', 'deposit', '--help'])
    expectSubstringsPrinted('amount', 'in PLUR')
  })

  it('should show units after running: cheque list', async () => {
    await invokeTestCli(['cheque', 'list', '--bee-debug-api-url', 'http://localhost:1378'])
    expectSubstringsPrinted('Cheque Value', 'PLUR')
  })

  it('should show units after running: cheque cashout', async () => {
    await invokeTestCli(['cheque', 'cashout', '--all', '--bee-debug-api-url', 'http://localhost:1378'])
    expectSubstringsPrinted('Cheque Value', 'PLUR')
  })

  it('should show units after running: cheque balance', async () => {
    await invokeTestCli(['cheque', 'balance', '--bee-debug-api-url', 'http://localhost:1378'])
    expectSubstringsPrinted('Total', 'PLUR')
    expectSubstringsPrinted('Available', 'PLUR')
  })
})
