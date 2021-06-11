import { describeCommand, invokeTestCli } from '../utility'

describeCommand(
  'Specifying Large Numbers',
  ({ consoleMessages }) => {
    it('should be possible with underscores and units', async () => {
      await invokeTestCli(['stamp', 'buy', '--amount', '1_000K', '--depth', '16', '--gas-price', '10_000'])
      expect(consoleMessages[consoleMessages.length - 1]).toContain('Stamp ID:')
    })
  },
  { configFileName: 'numerical' },
)
