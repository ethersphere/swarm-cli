import { existsSync, unlinkSync } from 'fs'
import { cli, Utils } from 'furious-commander'
import { join } from 'path'
import { Create } from '../../src/command/identity/create'
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
    // create identity
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['identity', 'create', '--identity-name', 'test', '--password', 'test'],
    })
    // upload
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [
        'feed',
        'upload',
        `${__dirname}/../testpage/images/swarm.png`,
        '--identity',
        'test',
        '--topic',
        'test',
        '--password',
        'test',
        '--hash-topic',
        '--quiet',
      ],
    })
    // print with identity and password
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
        '--quiet',
      ],
    })
    const length = consoleMessages.length
    expect(consoleMessages[length - 1]).toMatch(/[a-z0-9]{64}/)
  })

  it('should print feed using address only', async () => {
    // create identity
    const commandBuilder = await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['identity', 'create', '--identity-name', 'test2', '--password', 'test'],
    })
    const identityCreate = Utils.getCommandInstance(commandBuilder.initedCommands, ['identity', 'create']) as Create
    const address = identityCreate.wallet.getAddressString()
    // upload
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [
        'feed',
        'upload',
        `${__dirname}/../testpage/index.html`,
        '--identity',
        'test2',
        '--password',
        'test',
      ],
    })
    // print with address
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['feed', 'print', '--address', address],
    })
    const length = consoleMessages.length
    expect(consoleMessages[length - 1]).toMatch(/[a-z0-9]{64}/)
  })
})
