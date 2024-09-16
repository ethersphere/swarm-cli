import { describeCommand, invokeTestCli } from '../utility'

describeCommand('Test Stake command', ({ consoleMessages }) => {
  it('should print stake balance', async () => {
    await invokeTestCli(['stake'])
    expect(consoleMessages[0]).toContain('Staked xBZZ')
  })

  it('should print balance in quiet mode', async () => {
    await invokeTestCli(['stake', '--quiet'])

    const initialStake = parseFloat(consoleMessages[0].split(' ')[1])
    await invokeTestCli(['stake', '--quiet', '--deposit', '100_000T'])
    const afterDepositStake = parseFloat(consoleMessages[1].split(' ')[1])
    expect(afterDepositStake).toBeGreaterThan(initialStake)
  })
})
