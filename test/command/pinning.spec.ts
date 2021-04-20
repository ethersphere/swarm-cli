import { existsSync, unlinkSync } from 'fs'
import { cli, Utils } from 'furious-commander'
import { join } from 'path'
import { Upload } from '../../src/command/upload'
import { optionParameters, rootCommandClasses } from '../../src/config'

async function uploadAndGetHash(path: string, indexDocument?: string): Promise<string> {
  const extras = indexDocument ? ['--index-document', indexDocument] : []
  const builder = await cli({
    rootCommandClasses,
    optionParameters,
    testArguments: ['upload', path, ...extras],
  })
  const { hash } = Utils.getCommandInstance(builder.initedCommands, ['upload']) as Upload

  return hash
}

describe('Test Pinning command', () => {
  const configFolderPath = join(__dirname, '..', 'testconfig')
  const configFileName = 'pinning.config.json'
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

  it('should pin a collection with index.html index document', async () => {
    const hash = await uploadAndGetHash('test/testpage')
    expect(hash).toMatch(/[a-z0-9]{64}/)
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['pinning', 'pin', hash],
    })
    expect(consoleMessages).toHaveLength(4)
    const successMessage = consoleMessages[3]
    expect(successMessage).toBe('Pinned successfully')
  })

  it('should pin a collection with no index document', async () => {
    const hash = await uploadAndGetHash('test/command')
    expect(hash).toMatch(/[a-z0-9]{64}/)
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['pinning', 'pin', hash],
    })
    expect(consoleMessages).toHaveLength(3)
    const successMessage = consoleMessages[2]
    expect(successMessage).toBe('Pinned successfully')
  })

  it('should pin a collection with explicit index document', async () => {
    const hash = await uploadAndGetHash('test/command', 'pinning.spec.ts')
    expect(hash).toMatch(/[a-z0-9]{64}/)
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['pinning', 'pin', hash],
    })
    expect(consoleMessages).toHaveLength(3)
    const successMessage = consoleMessages[2]
    expect(successMessage).toBe('Pinned successfully')
  })
})
