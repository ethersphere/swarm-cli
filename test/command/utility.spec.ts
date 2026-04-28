import { describeCommand, invokeTestCli } from '../utility'

describeCommand('Test Utility rchash command', ({ consoleMessages }) => {
  it('should print reserve sampling duration', async () => {
    await invokeTestCli(['utility', 'rchash'])
    expect(consoleMessages.find(m => m.includes('Reserve sampling duration'))).toBeTruthy()
  })

  it('should print reserve sampling duration with custom depth', async () => {
    await invokeTestCli(['utility', 'rchash', '--depth', '2'])
    expect(consoleMessages.find(m => m.includes('Reserve sampling duration'))).toBeTruthy()
  })
})
