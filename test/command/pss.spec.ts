import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { Receive } from '../../src/command/pss/receive'
import { sleep } from '../../src/utils'
import { describeCommand, invokeTestCli } from '../utility'
import { getWorkerPssAddress } from '../utility/address'
import { getStampOption } from '../utility/stamp'

describeCommand('Test PSS command', ({ getNthLastMessage, getLastMessage }) => {
  it('should receive sent pss message', async () => {
    const invocation = invokeTestCli([
      'pss',
      'receive',
      '--topic-string',
      'PSS Test',
      '--bee-api-url',
      'http://localhost:11633',
      '--timeout',
      '10000',
    ])
    await sleep(1000)
    await invokeTestCli([
      'pss',
      'send',
      '--topic-string',
      'PSS Test',
      '--target',
      getWorkerPssAddress(4),
      '--message',
      'Bzzz Bzzzz Bzzzz',
      ...getStampOption(),
    ])
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
      '--topic-string',
      'PSS Test',
      '--bee-api-url',
      'http://localhost:11633',
      '--timeout',
      '10000',
      '--out-file',
      'test/testconfig/out.txt',
    ])
    await sleep(1000)
    await invokeTestCli([
      'pss',
      'send',
      '--topic-string',
      'PSS Test',
      '--target',
      getWorkerPssAddress(4),
      '--path',
      'test/testconfig/in.txt',
      ...getStampOption(),
    ])
    await sleep(1000)
    expect(existsSync('test/testconfig/out.txt')).toBeTruthy()
    const messageFromFile = readFileSync('test/testconfig/out.txt', 'ascii')
    expect(messageFromFile).toBe('Message in a file')
  })

  it('should not allow non-hex strings for target', async () => {
    await invokeTestCli([
      'pss',
      'send',
      '-T',
      'PSS Test',
      '--target',
      'bzzz',
      '--message',
      'Bzzz Bzzzz Bzzzz',
      ...getStampOption(),
    ])
    expect(getLastMessage()).toContain('Expected hex string for target, got bzzz')
  })

  it('should not allow odd-length strings for target', async () => {
    await invokeTestCli([
      'pss',
      'send',
      '-T',
      'PSS Test',
      '--target',
      'abc',
      '--message',
      'Bzzz Bzzzz Bzzzz',
      ...getStampOption(),
    ])
    expect(getLastMessage()).toContain('[target] must have even length')
  })

  it('should timeout during receive', async () => {
    await invokeTestCli(['pss', 'receive', '-T', 'PSS Test', '--timeout', '1'])
    expect(getLastMessage()).toContain('Receive timed out')
  })

  it('should not allow sending payload above 4000 bytes', async () => {
    await invokeTestCli([
      'pss',
      'send',
      '-T',
      'PSS Test',
      '--target',
      getWorkerPssAddress(4),
      '--message',
      '0'.repeat(4001),
      ...getStampOption(),
    ])
    expect(getNthLastMessage(2)).toContain('Maximum payload size is 4000 bytes.')
    expect(getLastMessage()).toContain('You tried sending 4001 bytes.')
  })

  it('should allow sending payload of 4000 bytes', async () => {
    await invokeTestCli([
      'pss',
      'send',
      '-T',
      'PSS Test',
      '--target',
      getWorkerPssAddress(4),
      '--message',
      '0'.repeat(4000),
      ...getStampOption(),
    ])
    expect(getLastMessage()).toContain('Message sent successfully.')
  })

  it('should not allow sending multibyte payload above 4000 bytes', async () => {
    await invokeTestCli([
      'pss',
      'send',
      '-T',
      'PSS Test',
      '--target',
      getWorkerPssAddress(4),
      '--message',
      '😃'.repeat(1001),
      ...getStampOption(),
    ])
    expect(getNthLastMessage(2)).toContain('Maximum payload size is 4000 bytes.')
    expect(getLastMessage()).toContain('You tried sending 4004 bytes.')
  })

  it('should allow sending multibyte payload of 4000 bytes', async () => {
    await invokeTestCli([
      'pss',
      'send',
      '-T',
      'PSS Test',
      '--target',
      getWorkerPssAddress(4),
      '--message',
      '😃'.repeat(1000),
      ...getStampOption(),
    ])
    expect(getLastMessage()).toContain('Message sent successfully.')
  })
})
