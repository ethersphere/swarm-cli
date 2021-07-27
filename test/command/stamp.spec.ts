import { describeCommand, invokeTestCli } from '../utility'

describeCommand('Test Stamp command', ({ consoleMessages, getLastMessage }) => {
  it('should list stamps', async () => {
    await invokeTestCli(['stamp', 'list'])
    expect(consoleMessages[0]).toContain('Stamp ID:')
    expect(consoleMessages[1]).toContain('Usage:')
  })

  it('should show a specific stamp', async () => {
    await invokeTestCli(['stamp', 'show', process.env.STAMP || ''])
    expect(consoleMessages[0]).toContain('Stamp ID:')
    expect(consoleMessages[0]).toContain(process.env.STAMP)
    expect(consoleMessages[1]).toContain('Usage:')
  })

  it('should not allow buying stamp with amount 0', async () => {
    await invokeTestCli(['stamp', 'buy', '--amount', '0', '--depth', '20'])
    expect(getLastMessage()).toContain('[amount] must be at least 1')
  })

  it('should not allow buying stamp with depth 16', async () => {
    await invokeTestCli(['stamp', 'buy', '--amount', '1', '--depth', '16'])
    expect(getLastMessage()).toContain('[depth] must be at least 17')
  })

  it('should buy stamp', async () => {
    await invokeTestCli(['stamp', 'buy', '--amount', '100000', '--depth', '20'])
    expect(getLastMessage()).toContain('Stamp ID:')
  })

  it('should print custom message when there are no stamps', async () => {
    await invokeTestCli(['stamp', 'list', '--bee-api-url', 'http://localhost:11633'])
    expect(getLastMessage()).toContain('You do not have any stamps.')
  })

  it('should list with sorting and filter', async () => {
    await invokeTestCli(['stamp', 'list', '--min-usage', '0', '--max-usage', '100', '--least-used', '--limit', '1'])
    expect(getLastMessage()).toContain('Usage:')
  })
})
