import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { Receive } from '../../src/command/pss/receive'
import { sleep } from '../../src/utils'
import { describeCommand, invokeTestCli } from '../utility'
import { getWorkerPssAddress } from '../utility/address'
import { getStampOption } from '../utility/stamp'

let topicCounter = 1000

async function sendAndExpect(message: string): Promise<void> {
  const topic = String(topicCounter++)
  const receiveCommand = invokeTestCli([
    'pss',
    'receive',
    '--topic-string',
    topic,
    '--bee-api-url',
    'http://localhost:11633',
    '--timeout',
    '120000',
  ])
  await sleep(1000)
  await callSend(message, topic)
  const { receivedMessage } = (await receiveCommand).runnable as Receive
  expect(receivedMessage).toBe(message)
}

async function callSend(message: string, topic: string): Promise<void> {
  await invokeTestCli([
    'pss',
    'send',
    '-T',
    topic,
    '--target',
    getWorkerPssAddress(4),
    '--message',
    message,
    ...getStampOption(),
  ])
}

describeCommand('Test PSS command', ({ getNthLastMessage, getLastMessage }) => {
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
      '30000',
      '--out-file',
      'test/testconfig/out.txt',
    ])
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
    await sleep(4000)
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
    await callSend('0'.repeat(4001), '4001 x 0')
    expect(getNthLastMessage(5)).toContain('Maximum payload size is 4000 bytes.')
    expect(getNthLastMessage(4)).toContain('You tried sending 4001 bytes.')
  })

  it('should allow sending payload of 4000 bytes', async () => {
    await callSend('0'.repeat(4000), '4000 x 0')
    expect(getLastMessage()).toContain('Message sent successfully.')
  })

  it('should not allow sending multibyte payload above 4000 bytes', async () => {
    await callSend('😃'.repeat(1001), 'emoji x 1001')
    expect(getNthLastMessage(5)).toContain('Maximum payload size is 4000 bytes.')
    expect(getNthLastMessage(4)).toContain('You tried sending 4004 bytes.')
  })

  it('should allow sending multibyte payload of 4000 bytes', async () => {
    await callSend('😃'.repeat(1000), 'emoji x 1000')
    expect(getLastMessage()).toContain('Message sent successfully.')
  })

  it('should receive multibyte data correctly', async () => {
    await sendAndExpect('🐝🐝🐝')
  })

  it('should receive zero bytes correctly', async () => {
    await sendAndExpect('\x00\x00\x00\x00')
  })

  it('should receive ascii text correctly', async () => {
    await sendAndExpect('A honey bee, a busy, flying insect that lives in a hive and makes honey.')
  })

  it('should receive utf-8 text correctly', async () => {
    await sendAndExpect('⠓⠑⠇⠇⠕ ⠃⠑⠑')
  })
})
