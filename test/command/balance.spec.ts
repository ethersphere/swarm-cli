import { createChequeMockHttpServer } from '../http-mock/cheque-mock'
import { describeCommand, invokeTestCli } from '../utility'

describeCommand('Test Status command', ({ consoleMessages }) => {
  let server: ReturnType<typeof createChequeMockHttpServer>

  beforeAll(() => {
    server = createChequeMockHttpServer(1379)
  })

  afterAll(() => {
    server.close()
  })

  it('should print balance', async () => {
    process.env.BEE_DEBUG_API_URL = 'http://localhost:1379'
    await invokeTestCli(['balance'])
    expect(consoleMessages[0]).toContain('Node wallet')
    expect(consoleMessages[1]).toContain('BZZ')
    expect(consoleMessages[2]).toContain('DAI')
    expect(consoleMessages[3]).toContain('Staked BZZ')
    expect(consoleMessages[5]).toContain('Chequebook')
    expect(consoleMessages[6]).toContain('Total')
    expect(consoleMessages[7]).toContain('Available')
  })

  it('should print balance in quiet mode', async () => {
    process.env.BEE_DEBUG_API_URL = 'http://localhost:1379'
    await invokeTestCli(['balance', '--quiet'])
    expect(consoleMessages[0]).toContain('wallet.bzz')
    expect(consoleMessages[1]).toContain('wallet.dai')
    expect(consoleMessages[2]).toContain('wallet.stake')
    expect(consoleMessages[3]).toContain('chequebook.total')
    expect(consoleMessages[4]).toContain('chequebook.available')
  })
})
