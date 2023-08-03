import { toMatchLinesInOrder } from '../custom-matcher'
import { createChequeMockHttpServer } from '../http-mock/cheque-mock'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

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
    const pattern = [['API'], ['[FAILED]']]
    expect(consoleMessages).toMatchLinesInOrder(pattern)
  })

  it('should print when debug api is unavailable', async () => {
    await invokeTestCli(['status', '--bee-debug-api-url', 'http://localhost:14999'])
    const pattern = [['Debug API'], ['[FAILED]']]
    expect(consoleMessages).toMatchLinesInOrder(pattern)
  })

  it('should print api and debug api connectivity', async () => {
    await invokeTestCli(['status'])
    const pattern = [['API'], ['[OK]'], ['Debug API'], ['[OK]']]
    expect(consoleMessages).toMatchLinesInOrder(pattern)
  })

  it('should print bee info', async () => {
    await invokeTestCli(['status'])
    const pattern = [['API'], ['Debug API'], ['Version'], ['Mode']]
    expect(consoleMessages).toMatchLinesInOrder(pattern)
  })

  it('should print topology', async () => {
    await invokeTestCli(['status'])
    const pattern = [['Connected Peers'], ['Population'], ['Depth']]
    expect(consoleMessages).toMatchLinesInOrder(pattern)
  })
})
