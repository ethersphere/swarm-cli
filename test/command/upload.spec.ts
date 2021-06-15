import { existsSync, unlinkSync, writeFileSync } from 'fs'
import inquirer from 'inquirer'
import type { Upload } from '../../src/command/upload'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describeCommand('Test Upload command', ({ consoleMessages, getNthLastMessage }) => {
  if (existsSync('test/data/8mb.bin')) {
    unlinkSync('test/data/8mb.bin')
  }

  writeFileSync('test/data/8mb.bin', Buffer.alloc(8_000_000))

  it('should upload testpage folder', async () => {
    const commandKey = 'upload'
    const uploadFolderPath = `${__dirname}/../testpage`
    const commandBuilder = await invokeTestCli([commandKey, uploadFolderPath, ...getStampOption()])

    expect(commandBuilder.initedCommands[0].command.name).toBe('upload')
    const command = commandBuilder.initedCommands[0].command as Upload
    expect(command.hash?.length).toBe(64)
  })

  it('should upload file', async () => {
    const commandKey = 'upload'
    const uploadFolderPath = `${__dirname}/../testpage/images/swarm.png`
    const commandBuilder = await invokeTestCli([commandKey, uploadFolderPath, ...getStampOption()])

    expect(commandBuilder.initedCommands[0].command.name).toBe('upload')
    const command = commandBuilder.initedCommands[0].command as Upload
    expect(command.hash?.length).toBe(64)
  })

  it('should warn for large files', async () => {
    inquirer.prompt = jest.fn().mockResolvedValueOnce({ value: false })
    await invokeTestCli(['upload', 'test/data/8mb.bin', ...getStampOption()])
    expect(inquirer.prompt).toHaveBeenCalledTimes(1)
  })

  it('should warn for large folders', async () => {
    inquirer.prompt = jest.fn().mockResolvedValueOnce({ value: false })
    await invokeTestCli(['upload', 'test/data', ...getStampOption()])
    expect(inquirer.prompt).toHaveBeenCalledTimes(1)
  })

  it('should fail for large files in quiet mode', async () => {
    await invokeTestCli(['upload', 'test/data/8mb.bin', '--quiet', ...getStampOption()])
    expect(consoleMessages[0]).toContain('File size is larger than recommended value')
  })

  it('should fail for large folders in quiet mode', async () => {
    await invokeTestCli(['upload', 'test/data', '--quiet', ...getStampOption()])
    expect(consoleMessages[0]).toContain('Folder size is larger than recommended value')
  })

  it('should not warn for large files with flag', async () => {
    await invokeTestCli(['upload', 'test/data/8mb.bin', '-v', '--size-check', 'false', ...getStampOption()])
    expect(getNthLastMessage(2)).toContain('Uploading was successful!')
  })

  it('should not warn for large folders with flag', async () => {
    await invokeTestCli(['upload', 'test/data', '-v', '--size-check', 'false', ...getStampOption()])
    expect(getNthLastMessage(2)).toContain('Uploading was successful!')
  })
})
