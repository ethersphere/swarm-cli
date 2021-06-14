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
  ({ consoleMessages, getLastMessage }) => {
    it('should pin a collection with index.html index document', async () => {
      const hash = await uploadAndGetHash('test/testpage')
      expect(hash).toMatch(/[a-z0-9]{64}/)
      await invokeTestCli(['pinning', 'pin', hash])
      expect(consoleMessages).toHaveLength(4)
      expect(consoleMessages[3]).toBe('Pinned successfully')
    })

    it('should pin a collection with no index document', async () => {
      const hash = await uploadAndGetHash('test/command')
      expect(hash).toMatch(/[a-z0-9]{64}/)
      await invokeTestCli(['pinning', 'pin', hash])
      expect(consoleMessages).toHaveLength(3)
      const successMessage = consoleMessages[2]
      expect(successMessage).toBe('Pinned successfully')
    })

    it('should pin a collection with explicit index document', async () => {
      const hash = await uploadAndGetHash('test/command', 'pinning.spec.ts')
      expect(hash).toMatch(/[a-z0-9]{64}/)
      await invokeTestCli(['pinning', 'pin', hash])
      expect(consoleMessages).toHaveLength(3)
      const successMessage = consoleMessages[2]
      expect(successMessage).toBe('Pinned successfully')
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
      expect(consoleMessages).toHaveLength(2)
      expect(consoleMessages[0]).toContain(
        'Could not pin ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      )
      expect(consoleMessages[1]).toContain('No root chunk found with that address.')
    })

    it('should print custom 404 when unpinning chunk that does not exist', async () => {
      await invokeTestCli(['pinning', 'unpin', 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'])
      expect(consoleMessages).toHaveLength(2)
      expect(consoleMessages[0]).toContain(
        'Could not unpin ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      )
      expect(consoleMessages[1]).toContain('No pinned chunk found with that address.')
    })

    it('should allow reuploading pinned file', async () => {
      const invocation = await invokeTestCli(['upload', 'README.md', '--pin', ...getStampOption()])
      const upload = invocation.runnable as Upload
      const { hash } = upload
      await invokeTestCli(['pinning', 'reupload', hash])
      expect(consoleMessages).toHaveLength(4)
      expect(consoleMessages[3]).toContain('Reuploaded successfully.')
    })

    it('should allow reuploading pinned folder', async () => {
      const invocation = await invokeTestCli(['upload', 'test', '--pin', ...getStampOption()])
      const upload = invocation.runnable as Upload
      const { hash } = upload
      await invokeTestCli(['pinning', 'reupload', hash])
      expect(consoleMessages).toHaveLength(4)
      expect(consoleMessages[3]).toContain('Reuploaded successfully.')
    })

    it('should reupload all pinned content', async () => {
      await invokeTestCli(['pinning', 'reupload-all'])
      expect(getLastMessage()).toMatch(/Reuploaded \d+ out of \d+ pinned chunks/)
    })
  },
  { configFileName: 'pinning' },
)
