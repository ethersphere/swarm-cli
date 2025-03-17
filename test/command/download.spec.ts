import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Upload } from '../../src/command/upload'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'
import { Addresses } from '../../src/command/addresses'

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
    const publicKey = addressesCommand.nodeAddresses.publicKey.toCompressedHex()
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
})
