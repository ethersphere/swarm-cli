import { invokeTestCli } from '../utility'

describe('Test Status command', () => {
  const consoleMessages: string[] = []

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

  it('should succeed with all checks', async () => {
    await invokeTestCli(['status'])
    expect(consoleMessages[0]).toContain('[OK]')
    expect(consoleMessages[1]).toContain('[OK]')
    expect(consoleMessages[2]).toContain('[OK]')
    expect(consoleMessages[4]).not.toContain('N/A')
  })

  it('should print less in quiet mode', async () => {
    await invokeTestCli(['status', '-q'])
    expect(consoleMessages[0]).toBe('OK - Bee API Connection')
    expect(consoleMessages[1]).toBe('OK - Bee Debug API Connection')
    expect(consoleMessages[2]).toBe('OK - Bee Version Compatibility')
    expect(consoleMessages[3]).not.toContain('N/A')
  })

  it('should report when bee api is not available', async () => {
    await invokeTestCli(['status', '--bee-api-url', 'http://localhost:14999'])
    expect(consoleMessages[0]).toContain('[FAILED]')
    expect(consoleMessages[1]).toContain('[OK]')
    expect(consoleMessages[2]).toContain('[OK]')
    expect(consoleMessages[4]).not.toContain('N/A')
  })

  it('should report when bee debug api is not available', async () => {
    await invokeTestCli(['status', '--bee-debug-api-url', 'http://localhost:14999'])
    expect(consoleMessages[0]).toContain('[OK]')
    expect(consoleMessages[1]).toContain('[FAILED]')
    expect(consoleMessages[2]).toContain('[FAILED]')
    expect(consoleMessages[4]).toContain('N/A')
  })
})
