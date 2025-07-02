import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'
import { getBeeDevOption } from '../utility/stamp'

expect.extend({
  toMatchLinesInOrder,
})

describeCommand('Test Wallet command', ({ consoleMessages }) => {
  test('should print wallet', async () => {
    await invokeTestCli(['wallet', 'status', ...getBeeDevOption()])
    expect(consoleMessages).toMatchLinesInOrder([['Wallet'], ['xBZZ'], ['xDAI']])
  })

  test('should withdraw xdai', async () => {
    await invokeTestCli([
      'wallet',
      'withdraw-dai',
      '--address',
      '00'.repeat(20),
      '--dai',
      '0.01',
      '--yes',
      ...getBeeDevOption(),
    ])
    expect(consoleMessages).toMatchLinesInOrder([
      ['must be whitelisted'],
      ['status code 400'],
      ['Transaction'],
      ['URL', 'gnosisscan'],
    ])
  })

  test('should withdraw xbzz', async () => {
    await invokeTestCli([
      'wallet',
      'withdraw-bzz',
      '--address',
      '00'.repeat(20),
      '--bzz',
      '0.01',
      '--yes',
      ...getBeeDevOption(),
    ])
    expect(consoleMessages).toMatchLinesInOrder([
      ['must be whitelisted'],
      ['status code 400'],
      ['Transaction'],
      ['URL', 'gnosisscan'],
    ])
  })
})
