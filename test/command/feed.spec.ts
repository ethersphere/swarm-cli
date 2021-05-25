import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { Create } from '../../src/command/identity/create'
import { Upload } from '../../src/command/upload'
import { invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

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
    await invokeTestCli(['identity', 'create', 'test', '--password', 'test'])
    // upload
    await invokeTestCli([
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
      ...getStampOption(),
    ])
    // print with identity and password
    await invokeTestCli([
      'feed',
      'print',
      '--identity',
      'test',
      '--topic',
      'test',
      '--password',
      'test',
      '--hash-topic',
      '--quiet',
      ...getStampOption(),
    ])
    const length = consoleMessages.length
    expect(consoleMessages[length - 1]).toMatch(/[a-z0-9]{64}/)
  })

  it('should print feed using address only', async () => {
    // create identity
    const commandBuilder = await invokeTestCli(['identity', 'create', 'test2', '--password', 'test'])
    const identityCreate = commandBuilder.runnable as Create
    const address = identityCreate.wallet.getAddressString()
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
    const length = consoleMessages.length
    expect(consoleMessages[length - 1]).toMatch(/[a-z0-9]{64}/)
  })

  it('should update feeds', async () => {
    await invokeTestCli(['identity', 'create', 'update-feed-test', '-P', '1234', '-v'])
    const uploadCommand = await invokeTestCli(['upload', 'README.md', '--skip-sync', ...getStampOption()])
    const upload = uploadCommand.runnable as Upload
    const { hash } = upload
    consoleMessages = []
    await invokeTestCli([
      'feed',
      'update',
      '--topic',
      'test-topic',
      '--hash-topic',
      '-i',
      'update-feed-test',
      '-P',
      '1234',
      '-r',
      hash,
      ...getStampOption(),
    ])
    expect(consoleMessages).toHaveLength(1)
    expect(consoleMessages[0]).toContain('Feed Manifest URL')
    expect(consoleMessages[0]).toContain('/bzz/')
  })
})
