import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

describeCommand('Test Monetary units', ({ consoleMessages }) => {
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
    await invokeTestCli(['cheque', 'list', '--bee-api-url', 'http://localhost:16337'])
    expectSubstringsPrinted('Cheque Value', 'xBZZ')
  })

  it('should show units after running: cheque cashout', async () => {
    await invokeTestCli(['cheque', 'cashout', '--all', '--bee-api-url', 'http://localhost:16337'])
    expectSubstringsPrinted('Cheque Value', 'xBZZ')
  })

  it('should show units after running: balance', async () => {
    await invokeTestCli(['status', '--bee-api-url', 'http://localhost:16337'])
    const pattern = [
      ['Wallet'],
      ['xBZZ', '10.0000000000000000'],
      ['xDAI', '5.000000000000000000'],
      ['Chequebook'],
      ['Available xBZZ', '0.0000000001000000'],
      ['Total xBZZ', '0.0000000001000000'],
    ]
    expect(consoleMessages).toMatchLinesInOrder(pattern)
  })
})
