import { describeCommand, invokeTestCli } from '../utility'
import BigNumber from 'bignumber.js'

describeCommand('Test Stake command', ({ consoleMessages }) => {
  it('should print stake balance', async () => {
    await invokeTestCli(['stake'])
    expect(consoleMessages[0]).toContain('Staked BZZ')
  })

  it('should print balance in quiet mode', async () => {
    await invokeTestCli(['stake', '--quiet'])

    const initialStake = BigNumber(consoleMessages[0])
    await invokeTestCli(['stake', '--quiet', '--deposit', '100_000T'])
    const afterDepositStake = BigNumber(consoleMessages[1])
    expect(afterDepositStake.minus(initialStake).isEqualTo(10)).toEqual(true)
  })
})
