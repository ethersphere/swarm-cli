import { invokeTestCli } from '../utility'

describe('Test Stamp command', () => {
  const consoleMessages: string[] = []
  const getLastMessage = () => consoleMessages[consoleMessages.length - 1]

  beforeAll(() => {
    global.console.log = jest.fn(message => {
      consoleMessages.push(message)
    })
    global.console.error = jest.fn(message => {
      consoleMessages.push(message)
    })
  })

  beforeEach(() => {
    consoleMessages.length = 0
  })

  it('should list stamps', async () => {
    await invokeTestCli(['stamp', 'list'])
    expect(consoleMessages[1]).toContain('Stamp ID:')
    expect(consoleMessages[2]).toContain('Utilization:')
  })

  it('should show a specific stamp', async () => {
    await invokeTestCli(['stamp', 'show', process.env.STAMP || ''])
    expect(consoleMessages[1]).toContain('Stamp ID:')
    expect(consoleMessages[1]).toContain(process.env.STAMP)
    expect(consoleMessages[2]).toContain('Utilization:')
  })

  it('should not allow buying stamp with amount 0', async () => {
    await invokeTestCli(['stamp', 'buy', '--amount', '0', '--depth', '20'])
    expect(getLastMessage()).toContain('[amount] must be at least 1')
  })

  it('should not allow buying stamp with depth 16', async () => {
    await invokeTestCli(['stamp', 'buy', '--amount', '1', '--depth', '15'])
    expect(getLastMessage()).toContain('[depth] must be at least 16')
  })

  it('should buy stamp', async () => {
    await invokeTestCli(['stamp', 'buy', '--amount', '100', '--depth', '20'])
    expect(getLastMessage()).toContain('Stamp ID:')
  })

  it('should print custom message when there are no stamps', async () => {
    await invokeTestCli(['stamp', 'list', '--bee-api-url', 'http://localhost:11633'])
    expect(getLastMessage()).toContain('You do not have any stamps.')
  })
})
