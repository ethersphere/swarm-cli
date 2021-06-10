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

  const getLastMessage = () => consoleMessages[consoleMessages.length - 1]

  if (existsSync(configFilePath)) {
    unlinkSync(configFilePath)
  }

  global.console.log = jest.fn(message => {
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
})
