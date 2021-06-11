import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
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

  it('should receive sent pss message with in/out files', async () => {
    if (existsSync('test/testconfig/out.txt')) {
      unlinkSync('test/testconfig/out.txt')
    }
    writeFileSync('test/testconfig/in.txt', 'Message in a file')
    invokeTestCli([
      'pss',
      'receive',
      '--bee-api-url',
      'http://localhost:11633',
      '--timeout',
      '10000',
      '--out-file',
      'test/testconfig/out.txt',
    ])
    await sleep(1000)
    await invokeTestCli(['pss', 'send', '--target', '00', '--path', 'test/testconfig/in.txt', ...getStampOption()])
    await sleep(1000)
    expect(existsSync('test/testconfig/out.txt')).toBeTruthy()
    const messageFromFile = readFileSync('test/testconfig/out.txt', 'ascii')
    expect(messageFromFile).toBe('Message in a file')
  })

  it('should not allow non-hex strings for target', async () => {
    await invokeTestCli(['pss', 'send', '--target', 'bzzz', '--data', 'Bzzz Bzzzz Bzzzz', ...getStampOption()])
    expect(getLastMessage()).toContain('Expected hex string for target, got bzzz')
  })

  it('should not allow odd-length strings for target', async () => {
    await invokeTestCli(['pss', 'send', '--target', 'abc', '--data', 'Bzzz Bzzzz Bzzzz', ...getStampOption()])
    expect(getLastMessage()).toContain('[target] must have even length')
  })

  it('should timeout during receive', async () => {
    await invokeTestCli(['pss', 'receive', '--timeout', '1'])
    expect(getLastMessage()).toContain('Receive timed out')
  })
})
