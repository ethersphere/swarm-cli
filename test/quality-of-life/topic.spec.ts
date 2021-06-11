import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

const TOPIC_HEX = '0x052ea901df6cdb4d5b2244ff46d0a4988f208541fe34beadc69906b86b4b2b29'

describe('Specifying Topics', () => {
  const configFolderPath = join(__dirname, '..', 'testconfig')
  const configFileName = 'topic.config.json'
  const configFilePath = join(configFolderPath, configFileName)
  const consoleMessages: string[] = []

  global.console.log = jest.fn(message => {
    consoleMessages.push(message)
  })
  global.console.error = jest.fn(message => {
    consoleMessages.push(message)
  })

  if (existsSync(configFilePath)) unlinkSync(configFilePath)

  process.env.SWARM_CLI_CONFIG_FOLDER = configFolderPath
  process.env.SWARM_CLI_CONFIG_FILE = configFileName

  beforeEach(() => {
    consoleMessages.length = 0
  })

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
      '.babelrc.js',
      ...getStampOption(),
    ])
  })

  it('should be possible with --topic in pss', async () => {
    await invokeTestCli(['pss', 'receive', '-t', TOPIC_HEX, '--timeout', '1'])
    expect(consoleMessages[0]).toContain('052ea901df6cdb4d5b2244ff46d0a4988f208541fe34beadc69906b86b4b2b29')
  })

  it('should be possible with --topic-string in pss', async () => {
    await invokeTestCli(['pss', 'receive', '-T', 'Awesome PSS Topic', '--timeout', '1'])
    expect(consoleMessages[0]).toContain('052ea901df6cdb4d5b2244ff46d0a4988f208541fe34beadc69906b86b4b2b29')
  })

  it('should be possible with --topic in feed', async () => {
    await invokeTestCli(['feed', 'print', '-t', TOPIC_HEX, '-i', 'topic', '-P', 'topic', ...getStampOption()])
    expect(consoleMessages[0]).toContain('052ea901df6cdb4d5b2244ff46d0a4988f208541fe34beadc69906b86b4b2b29')
  })

  it('should be possible with --topic-string in feed', async () => {
    await invokeTestCli(['feed', 'print', '-T', 'Awesome PSS Topic', '-i', 'topic', '-P', 'topic', ...getStampOption()])
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
    expect(consoleMessages[consoleMessages.length - 1]).toContain(
      'topic and topic-string are incompatible, please only specify one.',
    )
  })

  it('should not be possible with both --topic and --topic-string in pss', async () => {
    await invokeTestCli(['pss', 'receive', '-T', 'Awesome PSS Topic', '-t', TOPIC_HEX, '--timeout', '1'])
    expect(consoleMessages[consoleMessages.length - 1]).toContain(
      'topic and topic-string are incompatible, please only specify one.',
    )
  })
})
