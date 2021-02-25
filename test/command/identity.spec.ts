import { access, existsSync, unlinkSync } from 'fs'
import { cli, Utils } from 'furious-commander'
import { join } from 'path'
import { promisify } from 'util'
import { List } from '../../src/command/identity/list'
import { optionParameters, rootCommandClasses } from '../../src/config'

describe('Test Identity command', () => {
  const commandKey = 'identity'
  const configFolderPath = join(__dirname, '..', 'testconfig')
  const configFilePath = join(configFolderPath, 'config.json')
  const existFile = promisify(access)
  let consoleMessages: string[] = []

  beforeAll(() => {
    global.console.log = jest.fn(message => {
      consoleMessages.push(message)
    })
    jest.spyOn(global.console, 'warn')
    //set config environment variable
    process.env.SWARM_CLI_CONFIG_FOLDER = configFolderPath

    //remove config file if it exists
    if (existsSync(configFilePath)) unlinkSync(configFilePath)
  })

  beforeEach(() => {
    //clear stored console messages
    consoleMessages = []
  })

  it('should create default config on the first run', async () => {
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [commandKey, 'list'],
    })
    expect(await existFile(configFilePath)).toBeUndefined()
  })

  it('should create V3 identity "main"', async () => {
    const walletPassword = '123'

    // create identity
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [commandKey, 'create', '--password', walletPassword],
    })
    expect(consoleMessages[0]).toBe('Keypair has been generated successfully!')
  })

  it('should create simple identity "temporary-identity"', async () => {
    // create identity
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [commandKey, 'create', 'temporary-identity', '--only-keypair'],
    })
    expect(consoleMessages[0]).toBe('Keypair has been generated successfully!')
  })

  it('should list already created identities', async () => {
    // create identity
    const commandBuilder = await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [commandKey, 'list'],
    })
    expect(consoleMessages[0]).toContain('List of your identities')
    expect(consoleMessages[2].includes('Identity name') && consoleMessages[2].includes('main')).toBeTruthy()
    expect(
      consoleMessages[6].includes('Identity name') && consoleMessages[6].includes('temporary-identity'),
    ).toBeTruthy()
    const listCommand = Utils.getCommandInstance(commandBuilder.initedCommands, ['identity', 'list']) as List
    expect(Object.keys(listCommand.commandConfig.config.identities).length).toBe(2)
    expect(listCommand.commandConfig.config.identities.main).toBeDefined()
    expect(listCommand.commandConfig.config.identities['temporary-identity']).toBeDefined()
  })

  it('should remove identity "temporary-identity"', async () => {
    // remove identity
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [commandKey, 'remove', 'temporary-identity', '-f'],
    })
    expect(consoleMessages[0]).toBe('Identity has been successfully removed')
    // check it removed from the identity list
    const commandBuilder = await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [commandKey, 'list'],
    })
    const listCommand = Utils.getCommandInstance(commandBuilder.initedCommands, ['identity', 'list']) as List
    expect(Object.keys(listCommand.commandConfig.config.identities).length).toBe(1)
    expect(listCommand.commandConfig.config.identities['temporary-identity']).toBeUndefined()
  })

  it('should export v3 identity', async () => {
    // first create a v3 identity
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [commandKey, 'create', 'v3-identity', '--password', 'test'],
    })
    // then export it
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [commandKey, 'export', 'v3-identity'],
    })
    // and check if the last console message looked like a v3 wallet json
    const exportIndex = consoleMessages.length - 1
    expect(consoleMessages[exportIndex]).toContain('"ciphertext"')
  })
})
