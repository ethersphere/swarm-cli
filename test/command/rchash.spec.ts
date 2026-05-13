import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

describeCommand('Test Utility rchash command', ({ consoleMessages }) => {
  it('should print reserve sampling duration', async () => {
    await invokeTestCli(['utility', 'rchash'])
    expect(consoleMessages).toMatchLinesInOrder([['Reserve sampling duration']])
  })

  it('should print reserve sampling duration with custom depth', async () => {
    await invokeTestCli(['utility', 'rchash', '--depth', '2'])
    expect(consoleMessages).toMatchLinesInOrder([['Reserve sampling duration']])
  })
})
