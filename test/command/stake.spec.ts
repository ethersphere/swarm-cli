import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'
import { getBeeDevOption } from '../utility/stamp'

expect.extend({
  toMatchLinesInOrder,
})

describeCommand('Test Stake command', ({ consoleMessages }) => {
  test('should stake with bzz, plur, and print stake', async () => {
    await invokeTestCli(['stake', ...getBeeDevOption()])
    await invokeTestCli(['stake', '--deposit-bzz', '10', '--yes', ...getBeeDevOption()])
    await invokeTestCli(['stake', '--deposit', '10', '--yes', ...getBeeDevOption()])
    await invokeTestCli(['stake', ...getBeeDevOption()])
    expect(consoleMessages).toMatchLinesInOrder([
      ['Staked xBZZ', '0.0000000000000000'],
      ['Successfully staked!'],
      ['Staked xBZZ', '10.0000000000000000'],
      ['Successfully staked!'],
      ['Staked xBZZ', '10.0000000000000010'],
      ['Staked xBZZ', '10.0000000000000010'],
    ])
  })
})
