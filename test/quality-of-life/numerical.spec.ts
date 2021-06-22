import { describeCommand, invokeTestCli } from '../utility'

describeCommand(
  'Specifying Large Numbers',
  ({ getLastMessage }) => {
    it('should be possible with underscores and units', async () => {
      await invokeTestCli(['stamp', 'buy', '--amount', '1_000K', '--depth', '17', '--gas-price', '100_000_000'])
      expect(getLastMessage()).toContain('Stamp ID:')
    })
  },
  { configFileName: 'numerical' },
)
