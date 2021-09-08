import { statSync, writeFileSync } from 'fs'
import { ManifestCommand } from '../../src/command/manifest/manifest-command'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

async function runAndGetManifest(argv: string[]): Promise<string> {
  if (['create', 'add', 'sync', 'merge', 'remove'].includes(argv[1])) {
    argv = [...argv, ...getStampOption()]
  }
  const commandBuilder = await invokeTestCli(argv)
  const command = commandBuilder.runnable as unknown as ManifestCommand

  return command.resultHash
}

describeCommand('Test Upload command', ({ consoleMessages, hasMessageContaining }) => {
  it('should add file', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'README.md'])
    expect(hasMessageContaining('README.md')).toBeFalsy()
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('README.md')).toBeTruthy()
    expect(hasMessageContaining('/bzz')).toBeFalsy()
    await invokeTestCli(['manifest', 'list', hash, '--print-bzz'])
    expect(hasMessageContaining('/bzz')).toBeTruthy()
    expect(hasMessageContaining('/bytes')).toBeFalsy()
    await invokeTestCli(['manifest', 'list', hash, '--print-bytes'])
    expect(hasMessageContaining('/bytes')).toBeTruthy()
  })

  it('should add folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'test/utility'])
    expect(hasMessageContaining('address.ts')).toBeFalsy()
    expect(hasMessageContaining('index.ts')).toBeFalsy()
    expect(hasMessageContaining('stamp.ts')).toBeFalsy()
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('address.ts')).toBeTruthy()
    expect(hasMessageContaining('index.ts')).toBeTruthy()
    expect(hasMessageContaining('stamp.ts')).toBeTruthy()
  })

  it('should remove file', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'README.md'])
    expect(hasMessageContaining('README.md')).toBeFalsy()
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('README.md')).toBeTruthy()
    hash = await runAndGetManifest(['manifest', 'remove', hash, 'README.md'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('README.md')).toBeFalsy()
  })

  it('should remove folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'README.md'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'test/utility', '--folder', 'utils'])
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('README.md')).toBeTruthy()
    expect(hasMessageContaining('utils/address.ts')).toBeTruthy()
    expect(hasMessageContaining('utils/index.ts')).toBeTruthy()
    expect(hasMessageContaining('utils/stamp.ts')).toBeTruthy()
    hash = await runAndGetManifest(['manifest', 'remove', hash, 'utils'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('README.md')).toBeTruthy()
    expect(hasMessageContaining('utils')).toBeFalsy()
  })

  it('should sync folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'sync', hash, 'test/utility'])
    writeFileSync('out.json', JSON.stringify(consoleMessages))
    expect(hasMessageContaining('[new] address.ts')).toBeTruthy()
    expect(hasMessageContaining('[new] index.ts')).toBeTruthy()
    expect(hasMessageContaining('[new] stamp.ts')).toBeTruthy()
    consoleMessages.length = 0
    hash = await runAndGetManifest(['manifest', 'sync', hash, 'test/utility'])
    expect(hasMessageContaining('[ ok] address.ts')).toBeTruthy()
    expect(hasMessageContaining('[ ok] index.ts')).toBeTruthy()
    expect(hasMessageContaining('[ ok] stamp.ts')).toBeTruthy()
    expect(hasMessageContaining('[new]')).toBeFalsy()
    consoleMessages.length = 0
    hash = await runAndGetManifest(['manifest', 'sync', hash, 'test/http-mock'])
    expect(hasMessageContaining('[new] cheque-mock.ts')).toBeTruthy()
    expect(hasMessageContaining('[ rm]')).toBeFalsy()
    consoleMessages.length = 0
    await runAndGetManifest(['manifest', 'sync', hash, 'test/http-mock', '--remove'])
    expect(hasMessageContaining('[ ok] cheque-mock.ts')).toBeTruthy()
    expect(hasMessageContaining('[ rm] address.ts')).toBeTruthy()
    expect(hasMessageContaining('[ rm] index.ts')).toBeTruthy()
    expect(hasMessageContaining('[ rm] stamp.ts')).toBeTruthy()
  })

  it('should download folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'sync', hash, 'test/utility'])
    await invokeTestCli(['manifest', 'download', hash, 'test/data'])
    expect(statSync('test/data/test/utility/address.ts')).toBeTruthy()
    expect(statSync('test/data/test/utility/index.ts')).toBeTruthy()
    expect(statSync('test/data/test/utility/stamp.ts')).toBeTruthy()
  })

  it('should merge manifests', async () => {
    let hash1 = await runAndGetManifest(['manifest', 'create'])
    hash1 = await runAndGetManifest(['manifest', 'add', hash1, 'README.md'])
    let hash2 = await runAndGetManifest(['manifest', 'create'])
    hash2 = await runAndGetManifest(['manifest', 'add', hash2, 'test/utility'])
    const hash = await runAndGetManifest(['manifest', 'merge', hash1, hash2])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('README.md')).toBeTruthy()
    expect(hasMessageContaining('address.ts')).toBeTruthy()
    expect(hasMessageContaining('index.ts')).toBeTruthy()
    expect(hasMessageContaining('stamp.ts')).toBeTruthy()
  })
})
