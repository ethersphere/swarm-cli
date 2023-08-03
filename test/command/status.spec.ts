import { Strings } from 'cafe-utility'
import { createChequeMockHttpServer } from '../http-mock/cheque-mock'
import { describeCommand, invokeTestCli } from '../utility'

describeCommand('Test Status command', ({ consoleMessages }) => {
  let server: ReturnType<typeof createChequeMockHttpServer>

  beforeAll(() => {
    server = createChequeMockHttpServer(1333)
  })

  afterAll(() => {
    server.close()
  })

  it('should print when api is unavailable', async () => {
    await invokeTestCli(['status', '--bee-api-url', 'http://localhost:14999'])
    await invokeTestCli(['status'])
    const pattern = [['API URL', '[FAILED]']]
    expect(Strings.linesMatchInOrder(consoleMessages, pattern))
  })

  it('should print when debug api is unavailable', async () => {
    await invokeTestCli(['status', '--bee-debug-api-url', 'http://localhost:14999'])
    await invokeTestCli(['status'])
    const pattern = [['Debug API URL', '[FAILED]']]
    expect(Strings.linesMatchInOrder(consoleMessages, pattern))
  })

  it('should print api and debug api connectivity', async () => {
    await invokeTestCli(['status'])
    const pattern = [
      ['API URL', '[OK]'],
      ['Debug API URL', '[OK]'],
    ]
    expect(Strings.linesMatchInOrder(consoleMessages, pattern))
  })

  it('should print bee info', async () => {
    await invokeTestCli(['status'])
    const pattern = [['API'], ['Debug API'], ['Version'], ['Mode']]
    expect(Strings.linesMatchInOrder(consoleMessages, pattern))
  })

  it('should print topology', async () => {
    await invokeTestCli(['status'])
    const pattern = [['Connected Peers'], ['Population'], ['Depth']]
    expect(Strings.linesMatchInOrder(consoleMessages, pattern))
  })
})
