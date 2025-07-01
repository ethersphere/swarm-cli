import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'
import { getBeeDevOption } from '../utility/stamp'

expect.extend({
  toMatchLinesInOrder,
})

describeCommand('Test Stake command', ({ consoleMessages }) => {
  test('should stake with bzz, plur, and print stake', async () => {
    await invokeTestCli(['stake', 'status', ...getBeeDevOption()])
    await invokeTestCli(['stake', 'deposit', '--bzz', '10', '--yes', ...getBeeDevOption()])
    await invokeTestCli(['stake', 'deposit', '--plur', '10', '--yes', ...getBeeDevOption()])
    await invokeTestCli(['stake', 'status', ...getBeeDevOption()])
    expect(consoleMessages).toMatchLinesInOrder([
      ['Staked xBZZ', '0.0000000000000000'],
      ['Stake deposited successfully!'],
      ['Stake deposited successfully!'],
      ['Staked xBZZ', '10.0000000000000010'],
    ])
  })
})
