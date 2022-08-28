import { FORMATTED_ERROR } from '../../src/command/root-command/printer'
import { Upload } from '../../src/command/upload'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

async function uploadAndGetHash(path: string, indexDocument?: string): Promise<string> {
  const extras = indexDocument ? ['--index-document', indexDocument] : []
  const builder = await invokeTestCli(['upload', path, ...getStampOption(), ...extras])
  const { hash } = builder.runnable as Upload

  return hash
}

describeCommand(
  'Test Pinning command',
  ({ consoleMessages, getLastMessage, hasMessageContaining }) => {
    it('should pin a collection with index.html index document', async () => {
      const hash = await uploadAndGetHash('test/testpage')
      expect(hash).toMatch(/[a-z0-9]{64}/)
      await invokeTestCli(['pinning', 'pin', hash])
      expect(hasMessageContaining('Pinned successfully')).toBeTruthy()
    })

    it('should pin a collection with no index document', async () => {
      const hash = await uploadAndGetHash('test/command')
      expect(hash).toMatch(/[a-z0-9]{64}/)
      await invokeTestCli(['pinning', 'pin', hash])
      expect(hasMessageContaining('Pinned successfully')).toBeTruthy()
    })

    it('should pin a collection with explicit index document', async () => {
      const hash = await uploadAndGetHash('test/command', 'pinning.spec.ts')
      expect(hash).toMatch(/[a-z0-9]{64}/)
      await invokeTestCli(['pinning', 'pin', hash])
      expect(hasMessageContaining('Pinned successfully')).toBeTruthy()
    })

    it('should list less pinned items after unpinning', async () => {
      const hash = await uploadAndGetHash('test/command')
      consoleMessages.length = 0
      await invokeTestCli(['pinning', 'list'])
      const containsHash = consoleMessages.some(message => message.includes(hash))
      expect(containsHash).toBe(true)
      const countOfItemsBefore = consoleMessages.length
      expect(countOfItemsBefore).toBeGreaterThanOrEqual(1)
      consoleMessages.length = 0
      await invokeTestCli(['pinning', 'unpin', hash])
      expect(consoleMessages.length).toBe(1)
      expect(consoleMessages[0]).toContain('Unpinned successfully')
      consoleMessages.length = 0
      await invokeTestCli(['pinning', 'list'])
      const containsHashAfterUnpin = consoleMessages.some(message => message.includes(hash))
      expect(containsHashAfterUnpin).toBe(false)
      const countOfItemsAfter = consoleMessages.length
      expect(countOfItemsAfter).toBeLessThan(countOfItemsBefore)
    })

    it('should print custom 404 when pinning chunk that does not exist', async () => {
      await invokeTestCli(['pinning', 'pin', 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'])
      expect(consoleMessages).toStrictEqual([
        FORMATTED_ERROR + ' Bee responded with HTTP 404 (Not Found).',
        '',
        'The error message is: No root chunk found with address ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        '',
        'There may be additional information in the Bee logs.',
      ])
    })

    it('should print custom 404 when unpinning chunk that does not exist', async () => {
      await invokeTestCli(['pinning', 'unpin', 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'])
      expect(consoleMessages).toStrictEqual([
        FORMATTED_ERROR + ' Bee responded with HTTP 404 (Not Found).',
        '',
        'The error message is: No root chunk found with address ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        '',
        'There may be additional information in the Bee logs.',
      ])
    })

    it('should allow reuploading pinned file', async () => {
      const invocation = await invokeTestCli(['upload', 'README.md', '--pin', ...getStampOption()])
      const upload = invocation.runnable as Upload
      const { hash } = upload
      await invokeTestCli(['pinning', 'reupload', hash])
      expect(getLastMessage()).toBe('Reuploaded successfully.')
    })

    it.skip('should allow reuploading pinned folder', async () => {
      const invocation = await invokeTestCli(['upload', 'test', '--pin', 'false', '--yes', ...getStampOption()])
      const upload = invocation.runnable as Upload
      const { hash } = upload
      await invokeTestCli(['pinning', 'reupload', hash])
      expect(getLastMessage()).toBe('Reuploaded successfully.')
    })

    it('should reupload all pinned content', async () => {
      await invokeTestCli(['pinning', 'reupload-all'])
      expect(getLastMessage()).toMatch(/Reuploaded \d+ out of \d+ pinned root chunks/)
    })
  },
  { configFileName: 'pinning' },
)
