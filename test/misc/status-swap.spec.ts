import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

describeCommand('Status command and swap', ({ consoleMessages }) => {
  it('should print wallet and chequebook balance', async () => {
    await invokeTestCli(['status', '--bee-api-url', 'http://localhost:16337'])
    expect(consoleMessages).toMatchLinesInOrder([
      ['Wallet'],
      ['xBZZ'],
      ['xDAI'],
      ['Chequebook'],
      ['Available xBZZ'],
      ['Total xBZZ'],
    ])
  })

  it('should handle missing wallet and chequebook balance', async () => {
    await invokeTestCli(['status', '--bee-api-url', 'http://localhost:16337'])
    expect(consoleMessages).toMatchLinesInOrder([
      ['Wallet'],
      ['Wallet balance not available'],
      ['This is normal if chequebook is disabled in the node configuration.'],
      ['Chequebook'],
      ['Wallet balance not available'],
      ['This is normal if chequebook is disabled in the node configuration.'],
    ])
  })
})
