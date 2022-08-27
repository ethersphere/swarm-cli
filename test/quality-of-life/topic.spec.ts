import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

const TOPIC_HEX = '0x052ea901df6cdb4d5b2244ff46d0a4988f208541fe34beadc69906b86b4b2b29'

describeCommand(
  'Specifying Topics',
  ({ consoleMessages, getLastMessage }) => {
    beforeAll(async () => {
      await invokeTestCli(['identity', 'create', 'topic', '-P', 'topic'])
      await invokeTestCli([
        'feed',
        'upload',
        '-t',
        TOPIC_HEX,
        '-i',
        'topic',
        '-P',
        'topic',
        'test/message.txt',
        ...getStampOption(),
      ])
    })

    // TODO: https://github.com/ethersphere/bee/issues/2041
    test.skip('should be possible with --topic in pss', async () => {
      await invokeTestCli(['pss', 'receive', '-t', TOPIC_HEX, '--timeout', '1'])
      expect(consoleMessages[0]).toContain('052ea901df6cdb4d5b2244ff46d0a4988f208541fe34beadc69906b86b4b2b29')
    })

    // TODO: https://github.com/ethersphere/bee/issues/2041
    test.skip('should be possible with --topic-string in pss', async () => {
      await invokeTestCli(['pss', 'receive', '-T', 'Awesome PSS Topic', '--timeout', '1'])
      expect(consoleMessages[0]).toContain('052ea901df6cdb4d5b2244ff46d0a4988f208541fe34beadc69906b86b4b2b29')
    })

    it('should be possible with --topic in feed', async () => {
      await invokeTestCli(['feed', 'print', '-t', TOPIC_HEX, '-i', 'topic', '-P', 'topic', ...getStampOption()])
      expect(consoleMessages[0]).toContain('052ea901df6cdb4d5b2244ff46d0a4988f208541fe34beadc69906b86b4b2b29')
    })

    it('should be possible with --topic-string in feed', async () => {
      await invokeTestCli([
        'feed',
        'print',
        '-T',
        'Awesome PSS Topic',
        '-i',
        'topic',
        '-P',
        'topic',
        ...getStampOption(),
      ])
      expect(consoleMessages[0]).toContain('052ea901df6cdb4d5b2244ff46d0a4988f208541fe34beadc69906b86b4b2b29')
    })

    it('should not be possible with both --topic and --topic-string in feed', async () => {
      await invokeTestCli([
        'feed',
        'print',
        '-t',
        TOPIC_HEX,
        '-T',
        'Awesome PSS Topic',
        '-i',
        'topic',
        '-P',
        'topic',
        ...getStampOption(),
      ])
      expect(getLastMessage()).toContain('[topic] and [topic-string] are incompatible, please only specify one')
    })

    // TODO: https://github.com/ethersphere/bee/issues/2041
    test.skip('should not be possible with both --topic and --topic-string in pss', async () => {
      await invokeTestCli(['pss', 'receive', '-T', 'Awesome PSS Topic', '-t', TOPIC_HEX, '--timeout', '1'])
      expect(getLastMessage()).toContain('[topic] and [topic-string] are incompatible, please only specify one')
    })
  },
  { configFileName: 'topic' },
)
