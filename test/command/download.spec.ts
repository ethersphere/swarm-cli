import { Binary } from 'cafe-utility'
import { existsSync, mkdtempSync, readdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Addresses } from '../../src/command/addresses'
import { Upload } from '../../src/command/upload'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), 'swarm-cli-testrun-'))
}

describeCommand('Test Download command', ({ consoleMessages }) => {
  it('should download and print to stdout', async () => {
    const file = 'message.txt'
    const invocation = await invokeTestCli(['upload', 'test/' + file, ...getStampOption()])
    const hash = (invocation.runnable as Upload).result.getOrThrow()
    consoleMessages.length = 0
    await invokeTestCli(['download', hash.toHex(), '--stdout'])
    expect(consoleMessages[0]).toContain('Hello Swarm!')
  })

  it('should download with act and print to stdout', async () => {
    const addressesInvocation = await invokeTestCli(['addresses'])
    const addressesCommand = addressesInvocation.runnable as Addresses
    const uploadInvocation = await invokeTestCli(['upload', 'test/message.txt', '--act', ...getStampOption()])
    const uploadCommand = uploadInvocation.runnable as Upload
    const ref = uploadCommand.result.getOrThrow().toHex()
    const history = uploadCommand.historyAddress.getOrThrow().toHex()
    const publicKey = addressesCommand.nodeAddresses.publicKey.toHex()
    consoleMessages.length = 0
    await invokeTestCli([
      'download',
      ref,
      '--act',
      '--act-history-address',
      history,
      '--act-publisher',
      publicKey,
      '--stdout',
    ])
    expect(consoleMessages[0]).toContain('Hello Swarm!')
  })

  it('should fall back to manifest download', async () => {
    const tmpDir = makeTmpDir()
    const invocation = await invokeTestCli(['upload', 'test/testpage', ...getStampOption()])
    const hash = (invocation.runnable as Upload).result.getOrThrow()
    consoleMessages.length = 0
    await invokeTestCli(['download', hash.toHex(), tmpDir])
    expect(consoleMessages.some(x => x.includes('images/swarm.png'))).toBe(true)
    expect(consoleMessages.some(x => x.includes('index.html'))).toBe(true)
    expect(consoleMessages.some(x => x.includes('swarm.bzz'))).toBe(true)
  })

  it('should ignore --stdout if downloading folder', async () => {
    const tmpDir = makeTmpDir()
    const invocation = await invokeTestCli(['upload', 'test/testpage', ...getStampOption()])
    const hash = (invocation.runnable as Upload).result.getOrThrow()
    consoleMessages.length = 0
    await invokeTestCli(['download', hash.toHex(), tmpDir, '--stdout'])
    expect(consoleMessages.some(x => x.includes('images/swarm.png'))).toBe(true)
    expect(consoleMessages.some(x => x.includes('index.html'))).toBe(true)
    expect(consoleMessages.some(x => x.includes('swarm.bzz'))).toBe(true)
  })

  it('should download an encrypted file', async () => {
    const invocation = await invokeTestCli(['upload', 'docs/upload.gif', '--encrypt', ...getStampOption()])
    const hash = (invocation.runnable as Upload).result.getOrThrow()
    expect(hash.toHex()).toHaveLength(128)
    expect(existsSync('upload.gif')).toBe(false)
    await invokeTestCli(['download', hash.toHex()])
    expect(existsSync('upload.gif')).toBe(true)
    const data1 = readFileSync('upload.gif')
    const data2 = readFileSync('docs/upload.gif')
    expect(Binary.equals(data1, data2)).toBe(true)
  })

  it('should download an encrypted folder', async () => {
    const invocation = await invokeTestCli(['upload', 'docs', '--encrypt', ...getStampOption()])
    const hash = (invocation.runnable as Upload).result.getOrThrow()
    expect(hash.toHex()).toHaveLength(128)
    await invokeTestCli(['download', hash.toHex()])
    expect(existsSync(hash.toHex())).toBe(true)
    const content = readdirSync(hash.toHex())
    expect(content.length).toBe(4)
    expect(content.includes('upload.gif')).toBe(true)
    expect(content.includes('stamp-buy.gif')).toBe(true)
    expect(content.includes('identity-create.gif')).toBe(true)
    expect(content.includes('feed-upload.gif')).toBe(true)
  })
})
