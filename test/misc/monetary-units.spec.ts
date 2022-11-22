import chalk from 'chalk'
import { createChequeMockHttpServer } from '../http-mock/cheque-mock'
import { describeCommand, invokeTestCli } from '../utility'

describeCommand('Test Monetary units', ({ consoleMessages }) => {
  let server: ReturnType<typeof createChequeMockHttpServer>

  beforeAll(() => {
    server = createChequeMockHttpServer(1378)
  })

  afterAll(() => {
    server.close()
  })

  const containsAllSubstrings = (string: string, substrings: string[]): boolean => {
    return substrings.every(substring => string.includes(substring))
  }

  const substringsPrinted = (substrings: string[]): boolean => {
    return Boolean(consoleMessages.find(message => containsAllSubstrings(message, substrings)))
  }

  const expectSubstringsPrinted = (...substrings: string[]): void => {
    expect(substringsPrinted(substrings)).toBe(true)
  }

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
    expectSubstringsPrinted('--gas-price', 'in wei')
    expectSubstringsPrinted('--gas-limit', 'in wei')
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

  it('should show units after running: balance', async () => {
    await invokeTestCli(['balance', '--bee-debug-api-url', 'http://localhost:1378'])
    expect(consoleMessages).toEqual([
      chalk.bold('Node wallet'),
      `${chalk.green.bold('BZZ:')} 0.3904`,
      `${chalk.green.bold('DAI:')} 0.09610`,
      '',
      chalk.bold('Chequebook (BZZ)'),
      `${chalk.green.bold('Total:')} 10.002685`,
      `${chalk.green.bold('Available:')} 10.001856`,
    ])
  })
})
