import { Bee } from '@ethersphere/bee-js'
import { System } from 'cafe-utility'
import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

describeCommand('Test Utility rchash command', ({ consoleMessages }) => {
  it('should print reserve sampling duration', async () => {
    await System.waitFor(
      async () => {
        const bee = new Bee('http://localhost:1633')
        const status = await bee.getStatus()

        return status.isWarmingUp === false
      },
      { attempts: 300, waitMillis: 1000 },
    )
    await invokeTestCli(['utility', 'rchash'])
    expect(consoleMessages).toMatchLinesInOrder([['Reserve sampling duration']])
  })

  it('should print reserve sampling duration with custom depth', async () => {
    await System.waitFor(
      async () => {
        const bee = new Bee('http://localhost:1633')
        const status = await bee.getStatus()

        return status.isWarmingUp === false
      },
      { attempts: 300, waitMillis: 1000 },
    )
    await invokeTestCli(['utility', 'rchash', '--depth', '2'])
    expect(consoleMessages).toMatchLinesInOrder([['Reserve sampling duration']])
  })
})
