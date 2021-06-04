import { Receive } from '../../src/command/pss/receive'
import { sleep } from '../../src/utils'
import { invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describe('Test PSS command', () => {
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

  it('should receive sent pss message', async () => {
    const invocation = invokeTestCli([
      'pss',
      'receive',
      '--bee-api-url',
      'http://localhost:11633',
      '--timeout',
      '10000',
    ])
    await sleep(1000)
    await invokeTestCli(['pss', 'send', '--target', '00', '--data', 'Bzzz Bzzzz Bzzzz', ...getStampOption()])
    const receive: Receive = (await invocation).runnable as Receive
    expect(receive.receivedMessage).toBe('Bzzz Bzzzz Bzzzz')
  })

  it('should not allow non-hex strings for target', async () => {
    await invokeTestCli(['pss', 'send', '--target', 'bzzz', '--data', 'Bzzz Bzzzz Bzzzz', ...getStampOption()])
    expect(getLastMessage()).toContain('Target must be an even-length hex string')
  })

  it('should not allow odd-length strings for target', async () => {
    await invokeTestCli(['pss', 'send', '--target', 'abc', '--data', 'Bzzz Bzzzz Bzzzz', ...getStampOption()])
    expect(getLastMessage()).toContain('Target must be an even-length hex string')
  })

  it('should timeout during receive', async () => {
    await invokeTestCli(['pss', 'receive', '--timeout', '1'])
    expect(getLastMessage()).toContain('Receive timed out')
  })
})
