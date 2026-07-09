import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

describeCommand('Test Status command', ({ consoleMessages }) => {
  it('should print when api is unavailable', async () => {
    await invokeTestCli(['status', '--bee-api-url', 'http://localhost:14999'])
    await invokeTestCli(['status'])
    const pattern = [['API'], ['[FAILED]']]
    expect(consoleMessages).toMatchLinesInOrder(pattern)
  })

  it('should print api connectivity', async () => {
    await invokeTestCli(['status'])
    const pattern = [['API'], ['[OK]']]
    expect(consoleMessages).toMatchLinesInOrder(pattern)
  })

  it('should print bee info', async () => {
    await invokeTestCli(['status'])
    const pattern = [['API'], ['Version'], ['Mode']]
    expect(consoleMessages).toMatchLinesInOrder(pattern)
  })

  it('should print topology', async () => {
    await invokeTestCli(['status'])
    const pattern = [['Connected Peers'], ['Population'], ['Depth']]
    expect(consoleMessages).toMatchLinesInOrder(pattern)
  })
})
