import { Upload } from '../../src/command/upload'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describeCommand(
  'Test Feed command',
  ({ consoleMessages, getLastMessage, hasMessageContaining }) => {
    it('should upload file, update feed and print it', async () => {
      // create identity
      await invokeTestCli(['identity', 'create', 'test', '--password', 'test'])
      // upload
      await invokeTestCli([
        'feed',
        'upload',
        `${__dirname}/../testpage/images/swarm.png`,
        '--identity',
        'test',
        '--topic-string',
        'test',
        '--password',
        'test',
        '--quiet',
        ...getStampOption(),
      ])
      // print with identity and password
      await invokeTestCli([
        'feed',
        'print',
        '--identity',
        'test',
        '--topic-string',
        'test',
        '--password',
        'test',
        '--quiet',
        ...getStampOption(),
      ])
      expect(getLastMessage()).toMatch(/[a-z0-9]{64}/)
    })

    it('should print feed using address only', async () => {
      // create identity
      await invokeTestCli(['identity', 'create', 'test2', '--password', 'test'])
      const address = getLastMessage().split(' ')[1]
      // upload
      await invokeTestCli([
        'feed',
        'upload',
        `${__dirname}/../testpage/index.html`,
        '--identity',
        'test2',
        '--password',
        'test',
        ...getStampOption(),
      ])
      // print with address
      await invokeTestCli(['feed', 'print', '--address', address, '--quiet', ...getStampOption()])
      expect(getLastMessage()).toMatch(/[a-z0-9]{64}/)
    })

    it('should update feeds', async () => {
      await invokeTestCli(['identity', 'create', 'update-feed-test', '-P', '1234', '-v'])
      const uploadCommand = await invokeTestCli(['upload', 'README.md', ...getStampOption()])
      const upload = uploadCommand.runnable as Upload
      const { hash } = upload
      consoleMessages.length = 0
      await invokeTestCli([
        'feed',
        'update',
        '--topic-string',
        'test-topic',
        '-i',
        'update-feed-test',
        '-P',
        '1234',
        '-r',
        hash,
        ...getStampOption(),
      ])
      expect(hasMessageContaining('Feed Manifest URL')).toBeTruthy()
      expect(hasMessageContaining('/bzz/')).toBeTruthy()
    })

    it('should increment number of updates for sequence feeds', async () => {
      await invokeTestCli(['identity', 'create', 'd12617', '--password', 'test'])
      await invokeTestCli([
        'feed',
        'upload',
        'README.md',
        '--identity',
        'd12617',
        '--password',
        'test',
        ...getStampOption(),
      ])
      await invokeTestCli(['feed', 'print', '--identity', 'd12617', '--password', 'test', ...getStampOption()])
      expect(getLastMessage()).toContain('Number of Updates')
      expect(getLastMessage()).toContain('1')
      await invokeTestCli([
        'feed',
        'upload',
        'CHANGELOG.md',
        '--identity',
        'd12617',
        '--password',
        'test',
        ...getStampOption(),
      ])
      await invokeTestCli(['feed', 'print', '--identity', 'd12617', '--password', 'test', ...getStampOption()])
      expect(getLastMessage()).toContain('Number of Updates')
      expect(getLastMessage()).toContain('2')
    })
  },
  { configFileName: 'feed' },
)
