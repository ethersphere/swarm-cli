import { existsSync, unlinkSync } from 'fs'
import { cli } from 'furious-commander'
import { join } from 'path'
import { optionParameters, rootCommandClasses } from '../../src/config'

describe('Test Feed command', () => {
  const configFolderPath = join(__dirname, '..', 'testconfig')
  const configFileName = 'feed.config.json'
  const configFilePath = join(configFolderPath, configFileName)
  let consoleMessages: string[] = []

  beforeAll(() => {
    global.console.log = jest.fn(message => {
      consoleMessages.push(message)
    })
    jest.spyOn(global.console, 'warn')
    //set config environment variable
    process.env.SWARM_CLI_CONFIG_FOLDER = configFolderPath
    process.env.SWARM_CLI_CONFIG_FILE = configFileName

    //remove config file if it exists
    if (existsSync(configFilePath)) unlinkSync(configFilePath)
  })

  beforeEach(() => {
    //clear stored console messages
    consoleMessages = []
  })

  it('should upload file, update feed and print it', async () => {
    // first create identity
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['identity', 'create', '--identity-name', 'test', '--password', 'test'],
    })
    // then upload
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [
        'feed',
        'upload',
        '--identity',
        'test',
        '--topic',
        'test',
        '--password',
        'test',
        '--hash-topic',
        'true',
        '--path',
        `${__dirname}/../testpage/images/swarm.png`,
        '--verbosity',
        '2',
      ],
    })
    // finally verify
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [
        'feed',
        'print',
        '--identity',
        'test',
        '--topic',
        'test',
        '--password',
        'test',
        '--hash-topic',
        'true',
        '--verbosity',
        '2',
      ],
    })
    const length = consoleMessages.length
    let i = length - 10
    // check feed upload output
    expect(consoleMessages[i++]).toContain('Chunk Reference ->')
    expect(consoleMessages[i++]).toContain('Chunk Reference URL ->')
    expect(consoleMessages[i++]).toContain('Feed Reference ->')
    expect(consoleMessages[i++]).toContain('Feed Manifest ->')
    expect(consoleMessages[i++]).toContain('Feed Manifest URL ->')
    // check print output
    expect(consoleMessages[i++]).toContain('Chunk Reference ->')
    expect(consoleMessages[i++]).toContain('Chunk Reference URL ->')
    expect(consoleMessages[i++]).toContain('Feed Index ->')
    expect(consoleMessages[i++]).toContain('Next Index ->')
    expect(consoleMessages[i++]).toContain('Feed Manifest ->')
    expect(consoleMessages[i++]).toContain('Feed Manifest URL ->')
  })
})
