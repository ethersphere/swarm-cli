import { Reference } from '@ethersphere/bee-js'
import { readFileSync, statSync, writeFileSync } from 'fs'
import { Upload as FeedUpload } from '../../src/command/feed/upload'
import { RootCommand } from '../../src/command/root-command'
import { FORMATTED_ERROR } from '../../src/command/root-command/printer'
import { Upload } from '../../src/command/upload'
import { readdirDeepAsync } from '../../src/utils'
import { toMatchLinesInAnyOrder, toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

expect.extend({
  toMatchLinesInOrder,
  toMatchLinesInAnyOrder,
})

async function runAndGetManifest(argv: string[]): Promise<string> {
  if (['create', 'add', 'sync', 'merge', 'remove'].includes(argv[1])) {
    argv = [...argv, ...getStampOption()]
  }
  const commandBuilder = await invokeTestCli(argv)
  const command = commandBuilder.runnable as unknown as RootCommand

  return command.result.getOrThrow().toHex()
}

describeCommand('Test Manifest command', ({ consoleMessages, hasMessageContaining }) => {
  let srcHash: Reference

  beforeAll(async () => {
    const invocation = await invokeTestCli([
      'upload',
      'test/data/manifest',
      '--index-document',
      'index.txt',
      ...getStampOption(),
    ])
    srcHash = (invocation.runnable as Upload).result.getOrThrow()
  })

  it('should add file', async () => {
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

  it('should add folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'test/utility'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('address.ts')).toBeTruthy()
    expect(hasMessageContaining('index.ts')).toBeTruthy()
    expect(hasMessageContaining('stamp.ts')).toBeTruthy()
  })

  it('should add file with different name when using --as', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'README.md', '--as', 'docs/README.txt'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('README.md')).toBeFalsy()
    expect(hasMessageContaining('docs/README.txt')).toBeTruthy()
  })

  it('should handle both --as and --folder in add command', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash + '/misc', 'README.md', '--as', 'docs/README.txt'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash])
    expect(hasMessageContaining('misc/docs/README.txt')).toBeTruthy()
  })

  it('should remove file', async () => {
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

  it('should remove folder', async () => {
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

  it('should sync folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'sync', hash, 'test/utility'])
    expect(consoleMessages).toMatchLinesInAnyOrder([
      ['stamp.ts', 'NEW'],
      ['index.ts', 'NEW'],
      ['address.ts', 'NEW'],
    ])
    consoleMessages.length = 0
    hash = await runAndGetManifest(['manifest', 'sync', hash, 'test/utility'])
    expect(consoleMessages).toMatchLinesInAnyOrder([
      ['stamp.ts', 'UNCHANGED'],
      ['index.ts', 'UNCHANGED'],
      ['address.ts', 'UNCHANGED'],
    ])
    consoleMessages.length = 0
    hash = await runAndGetManifest(['manifest', 'sync', hash, 'test/testpage/images'])
    expect(consoleMessages).toMatchLinesInOrder([['swarm.png', 'NEW']])
    consoleMessages.length = 0
    await runAndGetManifest(['manifest', 'sync', hash, 'test/testpage/images', '--remove'])
    expect(consoleMessages).toMatchLinesInAnyOrder([
      ['swarm.png', 'UNCHANGED'],
      ['address.ts', 'REMOVED'],
      ['index.ts', 'REMOVED'],
      ['stamp.ts', 'REMOVED'],
    ])
  })

  it('should list single file', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'src'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', `bzz://${hash}/command/pss/send.ts`])
    expect(consoleMessages).toMatchLinesInAnyOrder([['Nodes'], ['command/pss/send.ts']])
    expect(consoleMessages).toHaveLength(3)
  })

  it('should list folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'src'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', `bzz://${hash}/command/pss`])
    expect(consoleMessages).toMatchLinesInAnyOrder([
      ['Nodes'],
      ['command/pss/index.ts'],
      ['command/pss/pss-command.ts'],
      ['command/pss/receive.ts'],
      ['command/pss/send.ts'],
      ['command/pss/subscribe.ts'],
    ])
    expect(consoleMessages).toHaveLength(11)
  })

  it('should download single file', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'src'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'download', `bzz://${hash}/command/pss/index.ts`, 'test/data/4'])
    expect(consoleMessages).toMatchLinesInOrder([['command/pss/index.ts'], ['OK']])
  })

  it('should download folder via bzz link', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'src'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'download', `bzz://${hash}/command/pss`, 'test/data/4'])
    expect(consoleMessages).toMatchLinesInOrder([
      ['command/pss/index.ts'],
      ['OK'],
      ['command/pss/pss-command.ts'],
      ['OK'],
      ['command/pss/receive.ts'],
      ['OK'],
      ['command/pss/send.ts'],
      ['OK'],
      ['command/pss/subscribe.ts'],
      ['OK'],
    ])
  })

  it('should download folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash + '/test/utility', 'test/utility'])
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'download', hash, 'test/data/1'])
    expect(statSync('test/data/1/test/utility/address.ts')).toBeTruthy()
    expect(statSync('test/data/1/test/utility/index.ts')).toBeTruthy()
    expect(statSync('test/data/1/test/utility/stamp.ts')).toBeTruthy()
  })

  it('should download only the specified folder', async () => {
    let hash = await runAndGetManifest(['manifest', 'create'])
    hash = await runAndGetManifest(['manifest', 'add', hash, 'README.md'])
    hash = await runAndGetManifest(['manifest', 'add', hash + '/utils', 'test/utility'])
    await invokeTestCli(['manifest', 'download', hash + '/utils', 'test/data/2'])
    const entries = await readdirDeepAsync('test/data/2', 'test/data/2')
    expect(entries).toHaveLength(3) // instead of 4
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

  it('should merge manifests and overwrite destination', async () => {
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

  it.skip('should list feed content', async () => {
    const identityName = `feed-resolve-test-${Date.now()}`
    await invokeTestCli(['identity', 'create', identityName, '--only-keypair'])
    const invocation = await invokeTestCli([
      'feed',
      'upload',
      'README.md',
      '--identity',
      identityName,
      ...getStampOption(),
    ])
    const command = invocation.runnable as unknown as FeedUpload
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', `${command.feedManifest}`])
    expect(consoleMessages).toMatchLinesInOrder([['README.md']])
  })

  it('should list single file when specified partially', async () => {
    await invokeTestCli(['manifest', 'list', `${srcHash}/ind`])
    expect(consoleMessages).toMatchLinesInOrder([['index.txt']])
  })

  it('should list single file when specified fully', async () => {
    await invokeTestCli(['manifest', 'list', `${srcHash}/index.txt`])
    expect(consoleMessages).toMatchLinesInOrder([['index.txt']])
  })

  it('should list files in folder when specified partially', async () => {
    await invokeTestCli(['manifest', 'list', `${srcHash}/lev`])
    expect(consoleMessages).toMatchLinesInOrder([['level-one/level-two/1.txt'], ['level-one/level-two/2.txt']])
  })

  it('should list files in folder when specified fully without trailing slash', async () => {
    await invokeTestCli(['manifest', 'list', `${srcHash}/level-one/level-two`])
    expect(consoleMessages).toMatchLinesInOrder([['level-one/level-two/1.txt'], ['level-one/level-two/2.txt']])
  })

  it('should list files in folder when specified fully with trailing slash', async () => {
    await invokeTestCli(['manifest', 'list', `${srcHash}/level-one/level-two/`])
    expect(consoleMessages).toMatchLinesInOrder([['level-one/level-two/1.txt'], ['level-one/level-two/2.txt']])
  })

  it('should download single file when specified partially', async () => {
    await invokeTestCli(['manifest', 'download', `${srcHash}/in`, 'test/data/6'])
    expect(consoleMessages).toMatchLinesInOrder([['index.txt']])
  })

  it('should download single file when specified fully', async () => {
    await invokeTestCli(['manifest', 'download', `${srcHash}/index.txt`, 'test/data/6'])
    expect(consoleMessages).toMatchLinesInOrder([['index.txt']])
  })

  it('should download files in folder when specified partially', async () => {
    await invokeTestCli(['manifest', 'download', `${srcHash}/level-one/l`, 'test/data/6'])
    expect(consoleMessages).toMatchLinesInOrder([['level-one/level-two/1.txt'], ['level-one/level-two/2.txt']])
  })

  it('should download files in folder when specified fully without trailing slash', async () => {
    await invokeTestCli(['manifest', 'download', `${srcHash}/level-one/level-two`, 'test/data/6'])
    expect(consoleMessages).toMatchLinesInOrder([['level-one/level-two/1.txt'], ['level-one/level-two/2.txt']])
  })

  it('should download files in folder when specified fully with trailing slash', async () => {
    await invokeTestCli(['manifest', 'download', `${srcHash}/level-one/level-two/`, 'test/data/6'])
    expect(consoleMessages).toMatchLinesInOrder([['level-one/level-two/1.txt'], ['level-one/level-two/2.txt']])
  })

  it('should handle error for invalid download hash', async () => {
    await invokeTestCli(['manifest', 'download', 'g'.repeat(64)])
    expect(consoleMessages[0]).toContain(
      FORMATTED_ERROR +
        ' Expected hex string for Bytes#constructor(bytes), got: gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
    )
  })

  it('should handle error for invalid list hash', async () => {
    await invokeTestCli(['manifest', 'list', 'g'.repeat(64)])
    expect(consoleMessages[0]).toContain(
      FORMATTED_ERROR +
        ' Expected hex string for Bytes#constructor(bytes), got: gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
    )
  })

  it('should handle error for 404 download hash', async () => {
    await invokeTestCli(['manifest', 'download', '1'.repeat(64)])
    expect(consoleMessages[0]).toContain('Bee responded with HTTP 404 (Not Found).')
  })

  it('should handle error for 404 list hash', async () => {
    await invokeTestCli(['manifest', 'list', '1'.repeat(64)])
    expect(consoleMessages[0]).toContain('Bee responded with HTTP 404 (Not Found).')
  })

  it('should handle error for invalid download path', async () => {
    await invokeTestCli(['manifest', 'download', `${srcHash}/b`])
    expect(consoleMessages[0]).toContain('No files found under the given path')
  })

  it('should handle error for invalid list path', async () => {
    await invokeTestCli(['manifest', 'list', `${srcHash}/b`])
    expect(consoleMessages[0]).toContain('No files found under the given path')
  })

  it('should be able to upload and download folder with default index.html', async () => {
    const invocation = await invokeTestCli(['upload', 'test/testpage', ...getStampOption()])
    const hash = (invocation.runnable as Upload).result.getOrThrow()
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'download', hash.toHex()])
    expect(consoleMessages).toMatchLinesInOrder([['images/swarm.png'], ['index.html'], ['swarm.bzz']])
  })

  it('should show root manifest metadata', async () => {
    const invocation = await invokeTestCli([
      'upload',
      'docs',
      ...getStampOption(),
      '--index-document',
      'index.txt',
      '--error-document',
      'error.txt',
    ])
    const hash = (invocation.runnable as Upload).result.getOrThrow()
    consoleMessages.length = 0
    await invokeTestCli(['manifest', 'list', hash.toHex()])
    expect(consoleMessages).toMatchLinesInOrder([
      ['Root (/) metadata'],
      ['website-index-document: index.txt'],
      ['website-error-document: error.txt'],
      ['Nodes'],
    ])
  })
})
