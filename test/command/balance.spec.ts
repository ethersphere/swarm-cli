import { createChequeMockHttpServer } from '../http-mock/cheque-mock'
import { describeCommand, invokeTestCli } from '../utility'

describeCommand('Test Status command', ({ consoleMessages }) => {
  const server = createChequeMockHttpServer(1377)

  afterAll(() => {
    server.close()
  })

  it('should print balance', async () => {
    process.env.BEE_DEBUG_API_URL = 'http://localhost:1377'
    await invokeTestCli(['balance'])
    expect(consoleMessages[1]).toContain('Total')
    expect(consoleMessages[1]).toContain('BZZ')
    expect(consoleMessages[2]).toContain('Available')
    expect(consoleMessages[2]).toContain('BZZ')
    expect(consoleMessages[3]).toContain('Wallet Balance')
    expect(consoleMessages[3]).toContain('BZZ')
    expect(consoleMessages[4]).toContain('Wallet Balance')
    expect(consoleMessages[4]).toContain('DAI')
  })
})
