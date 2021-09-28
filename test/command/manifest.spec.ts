import { readFileSync, statSync, writeFileSync } from 'fs'
import { ManifestCommand } from '../../src/command/manifest/manifest-command'
import { Upload } from '../../src/command/upload'
import { readdirDeepAsync } from '../../src/utils'
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
  let srcHash: string
  beforeAll(async () => {
    const invocation = await invokeTestCli(['upload', 'src', '--index-document', 'index.ts', ...getStampOption()])
    srcHash = (invocation.runnable as Upload).hash
  })

  it.skip('should add file', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'README.md'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('README.md')).toBeTruthy()
    expect(hasMessageContaining('/bzz')).toBeFalsy()
    await invokeTestCli(['manifest', 'list', hash, '--print-bzz'])
    expect(hasMessageContaining('/bzz')).toBeTruthy()
    expect(hasMessageContaining('/bytes')).toBeFalsy()
    await invokeTestCli(['manifest', 'list', hash, '--print-bytes'])
    expect(hasMessageContaining('/bytes')).toBeTruthy()
  })

  it.skip('should add folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'test/utility'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('address.ts')).toBeTruthy()
    expect(hasMessageContaining('index.ts')).toBeTruthy()
    expect(hasMessageContaining('stamp.ts')).toBeTruthy()
  })

  it.skip('should add file with different name when using --as', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'README.md', '--as', 'docs/README.txt'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('README.md')).toBeFalsy()
    expect(hasMessageContaining('docs/README.txt')).toBeTruthy()
  })

  it.skip('should handle both --as and --folder in add command', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash + '/misc', 'README.md', '--as', 'docs/README.txt'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('misc/docs/README.txt')).toBeTruthy()
  })

  it.skip('should remove file', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'README.md'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('README.md')).toBeTruthy()
    hash = await runAndGetManifest(['manifest', 'remove', hash + '/README.md'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('README.md')).toBeFalsy()
  })

  it.skip('should remove folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'README.md'])
    hash = await runAndGetManifest(['manifest', 'add', hash + '/utils', 'test/utility'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('README.md')).toBeTruthy()
    expect(hasMessageContaining('utils/address.ts')).toBeTruthy()
    expect(hasMessageContaining('utils/index.ts')).toBeTruthy()
    expect(hasMessageContaining('utils/stamp.ts')).toBeTruthy()
    hash = await runAndGetManifest(['manifest', 'remove', hash + '/utils'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('README.md')).toBeTruthy()
    expect(hasMessageContaining('utils')).toBeFalsy()
  })

  it.skip('should sync folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'sync', hash, 'test/utility'])
    expect(hasMessageContaining('new -> address.ts')).toBeTruthy()
    expect(hasMessageContaining('new -> index.ts')).toBeTruthy()
    expect(hasMessageContaining('new -> stamp.ts')).toBeTruthy()
    consoleMessages.length = 0
    hash = await runAndGetManifest(['manifest', 'sync', hash, 'test/utility'])
    expect(hasMessageContaining('ok -> address.ts')).toBeTruthy()
    expect(hasMessageContaining('ok -> index.ts')).toBeTruthy()
    expect(hasMessageContaining('ok -> stamp.ts')).toBeTruthy()
    expect(hasMessageContaining('new ->')).toBeFalsy()
    consoleMessages.length = 0
    hash = await runAndGetManifest(['manifest', 'sync', hash, 'test/http-mock'])
    expect(hasMessageContaining('new -> cheque-mock.ts')).toBeTruthy()
    expect(hasMessageContaining('removed ->')).toBeFalsy()
    consoleMessages.length = 0
    await runAndGetManifest(['manifest', 'sync', hash, 'test/http-mock', '--remove'])
    expect(hasMessageContaining('ok -> cheque-mock.ts')).toBeTruthy()
    expect(hasMessageContaining('removed -> address.ts')).toBeTruthy()
    expect(hasMessageContaining('removed -> index.ts')).toBeTruthy()
    expect(hasMessageContaining('removed -> stamp.ts')).toBeTruthy()
  })

  it.skip('should list single file', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'src'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', `bzz://${hash}/command/pss/send.ts`])
    expect(consoleMessages).toHaveLength(1)
  })

  it.skip('should list folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'src'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', `bzz://${hash}/command/pss`])
    expect(consoleMessages).toHaveLength(5)
  })

  it.skip('should download single file', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'src'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'download', `bzz://${hash}/command/pss/index.ts`, 'test/data/4'])
    expect(consoleMessages).toHaveLength(1)
  })

  it.skip('should download folder via bzz link', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'src'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'download', `bzz://${hash}/command/pss`, 'test/data/4'])
    expect(consoleMessages).toHaveLength(5)
  })

  it.skip('should download folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash + '/test/utility', 'test/utility'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'download', hash, 'test/data/1'])
    expect(statSync('test/data/1/test/utility/address.ts')).toBeTruthy()
    expect(statSync('test/data/1/test/utility/index.ts')).toBeTruthy()
    expect(statSync('test/data/1/test/utility/stamp.ts')).toBeTruthy()
  })

  it.skip('should download only the specified folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'README.md'])
    hash = await runAndGetManifest(['manifest', 'add', hash + '/utils', 'test/utility'])
    await invokeTestCli(['manifest', 'download', hash + '/utils', 'test/data/2'])
    const entries = await readdirDeepAsync('test/data/2', 'test/data/2')
    expect(entries).toHaveLength(3) // instead of 4
  })

  it.skip('should merge manifests', async () => {
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

  it.skip('should merge manifests and overwrite destination', async () => {
    writeFileSync('test/data/alpha.txt', '1')
    writeFileSync('test/data/bravo.txt', '2')
    let hash1 = await runAndGetManifest(['manifest', 'create'])
    hash1 = await runAndGetManifest(['manifest', 'add', hash1, 'test/data/alpha.txt'])
    hash1 = await runAndGetManifest(['manifest', 'add', hash1, 'test/data/bravo.txt'])
    let hash2 = await runAndGetManifest(['manifest', 'create'])
    hash2 = await runAndGetManifest(['manifest', 'add', hash2, 'test/data/alpha.txt', '--as', 'bravo.txt'])
    hash2 = await runAndGetManifest(['manifest', 'add', hash2, 'test/data/bravo.txt', '--as', 'alpha.txt'])
    const hash = await runAndGetManifest(['manifest', 'merge', hash1, hash2])
    await invokeTestCli(['manifest', 'download', hash, 'test/data/3'])
    expect(readFileSync('test/data/3/alpha.txt').toString()).toBe('2')
    expect(readFileSync('test/data/3/bravo.txt').toString()).toBe('1')
  })

  it('should list single file when specified partially', async () => {
    await invokeTestCli(['manifest', 'list', `${srcHash}/appli`])
    expect(consoleMessages[0]).toContain(['/application.ts'])
  })

  it('should list single file when specified fully', async () => {
    await invokeTestCli(['manifest', 'list', `${srcHash}/application.ts`])
    expect(consoleMessages[0]).toContain(['/application.ts'])
  })

  it('should list files in folder when specified partially', async () => {
    await invokeTestCli(['manifest', 'list', `${srcHash}/utils/ty`])
    expect(consoleMessages[0]).toContain(['/utils/types/config-option.ts'])
    expect(consoleMessages[1]).toContain(['/utils/types/index.ts'])
  })

  it('should list files in folder when specified fully without trailing slash', async () => {
    await invokeTestCli(['manifest', 'list', `${srcHash}/utils/types`])
    expect(consoleMessages[0]).toContain(['/utils/types/config-option.ts'])
    expect(consoleMessages[1]).toContain(['/utils/types/index.ts'])
  })

  it('should list files in folder when specified fully with trailing slash', async () => {
    await invokeTestCli(['manifest', 'list', `${srcHash}/utils/types/`])
    expect(consoleMessages[0]).toContain(['/utils/types/config-option.ts'])
    expect(consoleMessages[1]).toContain(['/utils/types/index.ts'])
  })

  it('should download single file when specified partially', async () => {
    await invokeTestCli(['manifest', 'download', `${srcHash}/appli`, 'test/data/6'])
    expect(consoleMessages[0]).toContain(['application.ts'])
  })

  it('should download single file when specified fully', async () => {
    await invokeTestCli(['manifest', 'download', `${srcHash}/application.ts`, 'test/data/6'])
    expect(consoleMessages[0]).toContain(['application.ts'])
  })

  it('should download files in folder when specified partially', async () => {
    await invokeTestCli(['manifest', 'download', `${srcHash}/utils/ty`, 'test/data/6'])
    expect(consoleMessages[0]).toContain(['utils/types/config-option.ts'])
    expect(consoleMessages[1]).toContain(['utils/types/index.ts'])
  })

  it('should download files in folder when specified fully without trailing slash', async () => {
    await invokeTestCli(['manifest', 'download', `${srcHash}/utils/types`, 'test/data/6'])
    expect(consoleMessages[0]).toContain(['utils/types/config-option.ts'])
    expect(consoleMessages[1]).toContain(['utils/types/index.ts'])
  })

  it('should download files in folder when specified fully with trailing slash', async () => {
    await invokeTestCli(['manifest', 'download', `${srcHash}/utils/types/`, 'test/data/6'])
    expect(consoleMessages[0]).toContain(['utils/types/config-option.ts'])
    expect(consoleMessages[1]).toContain(['utils/types/index.ts'])
  })
})
