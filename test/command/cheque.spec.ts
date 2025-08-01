import { describeCommand, invokeTestCli } from '../utility'

async function runCommandAndExpectError(
  argv: string[],
  errorPattern: string,
  consoleMessages: string[],
): Promise<void> {
  await invokeTestCli(argv)
  const lastConsoleMessage = consoleMessages[consoleMessages.length - 1]
  expect(lastConsoleMessage).toContain(errorPattern)
}

describeCommand(
  'Test Cheque command',
  ({ consoleMessages, getNthLastMessage, getLastMessage }) => {
    it('should print cheques', async () => {
      process.env.BEE_API_URL = 'http://localhost:16337'
      await invokeTestCli(['cheque', 'list'])
      expect(getLastMessage()).toContain('Cheque Value:')
      expect(getLastMessage()).toContain('0.0008944000000000 xBZZ')
    })

    it('should not print cheques when --minimum is higher', async () => {
      process.env.BEE_API_URL = 'http://localhost:16337'
      await invokeTestCli(['cheque', 'list', '--minimum', '10000000000000000000'])
      expect(getLastMessage()).toContain('No uncashed cheques found')
    })

    it('should print cheques when --minimum is lower', async () => {
      process.env.BEE_API_URL = 'http://localhost:16337'
      await invokeTestCli(['cheque', 'list', '--minimum', '1000'])
      expect(getLastMessage()).toContain('Cheque Value')
    })

    it('should cashout all cheques', async () => {
      process.env.BEE_API_URL = 'http://localhost:16337'
      await invokeTestCli(['cheque', 'cashout', '--all'])
      expect(getNthLastMessage(3)).toContain('Peer Address:')
      expect(getNthLastMessage(3)).toContain('1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad')
      expect(getNthLastMessage(2)).toContain('Cheque Value:')
      expect(getNthLastMessage(2)).toContain('0.0008944000000000 xBZZ')
      expect(getLastMessage()).toContain('Tx:')
      expect(getLastMessage()).toContain('11df9811dc8caaa1ff4389503f2493a8c46b30c0a0b5f8aa54adbb965374c0ae')
    })

    it('should allow specifying gas price and limit for cashout', async () => {
      process.env.BEE_API_URL = 'http://localhost:16337'
      await invokeTestCli(['cheque', 'cashout', '--all', '--gas-price', '100', '--gas-limit', '100'])
      expect(getLastMessage()).toContain('Tx:')
      expect(getLastMessage()).toContain('11df9811dc8caaa1ff4389503f2493a8c46b30c0a0b5f8aa54adbb965374c0ae')
    })

    it('should not cashout any cheques when --minimum is higher', async () => {
      process.env.BEE_API_URL = 'http://localhost:16337'
      await invokeTestCli(['cheque', 'cashout', '--all', '--minimum', '10000000000000000000'])
      expect(getLastMessage()).toContain('Found 0 cheques')
    })

    it('should cashout one specific cheque', async () => {
      process.env.BEE_API_URL = 'http://localhost:16337'
      await invokeTestCli([
        'cheque',
        'cashout',
        '--peer',
        '1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad',
      ])
      expect(getNthLastMessage(3)).toContain('Peer Address:')
      expect(getNthLastMessage(3)).toContain('1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad')
      expect(getNthLastMessage(2)).toContain('Cheque Value:')
      expect(getNthLastMessage(2)).toContain('0.0008944000000000 xBZZ')
      expect(getLastMessage()).toContain('Tx:')
      expect(getLastMessage()).toContain('11df9811dc8caaa1ff4389503f2493a8c46b30c0a0b5f8aa54adbb965374c0ae')
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
  },
  { configFileName: 'cheque' },
)
