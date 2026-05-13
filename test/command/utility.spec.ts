import { describeCommand, invokeTestCli } from '../utility'

describeCommand('Test Utility rchash command', ({ hasMessageContaining }) => {
  it('should print reserve sampling duration', async () => {
    await invokeTestCli(['utility', 'rchash'])
    expect(hasMessageContaining('Reserve sampling duration')).toBeTruthy()
  })

  it('should print reserve sampling duration with custom depth', async () => {
    await invokeTestCli(['utility', 'rchash', '--depth', '2'])
    expect(hasMessageContaining('Reserve sampling duration')).toBeTruthy()
  })
})
