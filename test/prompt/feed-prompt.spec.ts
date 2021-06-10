import { existsSync, unlinkSync } from 'fs'
import inquirer from 'inquirer'
import { join } from 'path'
import { invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describe('Using Feed Commands with Prompts', () => {
  const configFolderPath = join(__dirname, '..', 'testconfig')
  const configFileName = 'feed-prompt.config.json'
  const configFilePath = join(configFolderPath, configFileName)
  const consoleMessages: string[] = []

  const getNthLastMessage = (n: number) => consoleMessages[consoleMessages.length - n]
  const getLastMessage = () => consoleMessages[consoleMessages.length - 1]

  jest.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit() was called.')
  })

  if (existsSync(configFilePath)) {
    unlinkSync(configFilePath)
  }

  global.console.log = jest.fn(message => {
    consoleMessages.push(message)
  })
  global.console.error = jest.fn(message => {
    consoleMessages.push(message)
  })

  process.env.SWARM_CLI_CONFIG_FOLDER = configFolderPath
  process.env.SWARM_CLI_CONFIG_FILE = configFileName

  beforeEach(() => {
    consoleMessages.length = 0
  })

  it('feed upload should prompt for stamp, identity and password', async () => {
    await invokeTestCli(['identity', 'create', 'main', '-P', 'secret'])
    inquirer.prompt = jest
      .fn()
      .mockResolvedValueOnce({ value: getStampOption()[1] })
      .mockResolvedValueOnce({ value: 'main' })
      .mockResolvedValueOnce({ value: 'secret' })
    await invokeTestCli(['feed', 'upload', '-v', 'README.md'])
    expect(inquirer.prompt).toHaveBeenCalledTimes(3)
    expect(getLastMessage()).toContain('Successfully uploaded to feed.')
  })

  it('feed upload should prompt for identity when it is misspelled', async () => {
    inquirer.prompt = jest.fn().mockResolvedValueOnce({ value: 'main' })
    await invokeTestCli(['feed', 'upload', '-v', 'README.md', '-i', '_main', '-P', 'secret', ...getStampOption()])
    expect(inquirer.prompt).toHaveBeenCalledTimes(1)
    expect(getLastMessage()).toContain('Successfully uploaded to feed.')
  })

  it('feed upload should prompt for password when it is not given', async () => {
    inquirer.prompt = jest.fn().mockResolvedValueOnce({ value: 'secret' })
    await invokeTestCli(['feed', 'upload', '-v', 'README.md', '-i', 'main', ...getStampOption()])
    expect(inquirer.prompt).toHaveBeenCalledTimes(1)
    expect(getLastMessage()).toContain('Successfully uploaded to feed.')
  })

  it('feed upload should fail when running in quiet mode and stamp is missing', async () => {
    await invokeTestCli(['feed', 'upload', '-q', 'README.md', '-i', 'main', '-P', 'secret'])
    expect(getLastMessage()).toContain('Required option not provided: stamp')
  })

  it('feed upload should fail when running in quiet mode and identity is missing', async () => {
    await invokeTestCli(['feed', 'upload', '-q', 'README.md', '-P', 'secret', ...getStampOption()])
    expect(getLastMessage()).toContain('Required option not provided: identity')
  })

  it('feed upload should fail when running in quiet mode and identity is misspelled', async () => {
    await invokeTestCli(['feed', 'upload', '-q', 'README.md', '-i', '_main', '-P', 'secret', ...getStampOption()])
    expect(getNthLastMessage(4)).toContain('The provided identity does not exist.')
  })

  it('feed upload should fail when running in quiet mode and password is wrong', async () => {
    await invokeTestCli(['feed', 'upload', '-q', 'README.md', '-i', 'main', '-P', '_secret', ...getStampOption()])
    expect(getLastMessage()).toContain('Key derivation failed - possibly wrong passphrase')
  })

  it('feed upload should fail when running in quiet mode and password is missing', async () => {
    await invokeTestCli(['feed', 'upload', '-q', 'README.md', '-i', 'main', ...getStampOption()])
    expect(getLastMessage()).toContain('There is no password passed for V3 wallet initialization')
  })
})
