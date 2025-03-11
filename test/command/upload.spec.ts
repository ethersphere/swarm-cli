import { existsSync, unlinkSync, writeFileSync } from 'fs'
import type { Upload } from '../../src/command/upload'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describeCommand('Test Upload command', ({ consoleMessages, hasMessageContaining }) => {
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
    expect(command.result.getOrThrow().toHex().length).toBe(64)
  })

  it('should upload file', async () => {
    const commandKey = 'upload'
    const uploadFolderPath = `${__dirname}/../testpage/images/swarm.png`
    const commandBuilder = await invokeTestCli([commandKey, uploadFolderPath, ...getStampOption()])

    expect(commandBuilder.initedCommands[0].command.name).toBe('upload')
    const command = commandBuilder.initedCommands[0].command as Upload
    expect(command.result.getOrThrow().toHex().length).toBe(64)
  })

  it('should upload file and encrypt', async () => {
    const commandBuilder = await invokeTestCli(['upload', 'README.md', '--encrypt', ...getStampOption()])
    const uploadCommand = commandBuilder.runnable as Upload
    expect(uploadCommand.result.getOrThrow().toHex()).toHaveLength(128)
  })

  it('should upload file with act', async () => {
    const commandBuilder = await invokeTestCli(['upload', 'README.md', '--act', ...getStampOption()])
    const uploadCommand = commandBuilder.runnable as Upload
    expect(uploadCommand.result.getOrThrow()).toHaveLength(32)
    expect(uploadCommand.historyAddress.getOrThrow()).toHaveLength(32)
  })

  it('should upload file with act and history', async () => {
    const commandBuilder = await invokeTestCli(['upload', 'README.md', '--act', ...getStampOption()])
    const uploadCommand = commandBuilder.runnable as Upload
    const ref = uploadCommand.result.getOrThrow().toHex()
    const hist = uploadCommand.historyAddress.getOrThrow().toHex()

    // Upload with the same history address
    const commandBuilderWithHistory = await invokeTestCli([
      'upload',
      'README.md',
      '--act',
      '--act-history-address',
      hist,
      ...getStampOption(),
    ])
    const uploadCommandWithHistory = commandBuilderWithHistory.runnable as Upload
    expect(uploadCommandWithHistory.result.getOrThrow()).toHaveLength(32)
    expect(uploadCommandWithHistory.historyAddress.getOrThrow()).toHaveLength(32)

    const ref2 = uploadCommandWithHistory.result.getOrThrow().toHex()
    expect(ref).toBe(ref2) // Same reference
    const hist2 = uploadCommandWithHistory.historyAddress.getOrThrow().toHex()
    expect(hist).toBe(hist2) // Same history address
  })

  it('should upload folder and encrypt', async () => {
    const commandBuilder = await invokeTestCli(['upload', 'test/testpage', '--encrypt', ...getStampOption()])
    const uploadCommand = commandBuilder.runnable as Upload
    expect(uploadCommand.result.getOrThrow().toHex()).toHaveLength(128)
  })

  it('should not allow --encrypt for gateways', async () => {
    await invokeTestCli([
      'upload',
      'README.md',
      '--bee-api-url',
      'http://gateway.ethswarm.org',
      '--encrypt',
      ...getStampOption(),
    ])
    expect(hasMessageContaining('does not support encryption')).toBeTruthy()
  })

  it('should not allow --pin for gateways', async () => {
    await invokeTestCli([
      'upload',
      'README.md',
      '--bee-api-url',
      'http://gateway.ethswarm.org',
      '--pin',
      ...getStampOption(),
    ])
    expect(hasMessageContaining('does not support pinning')).toBeTruthy()
  })

  it('should not allow sync for gateways', async () => {
    await invokeTestCli([
      'upload',
      'README.md',
      '--sync',
      '--bee-api-url',
      'http://gateway.ethswarm.org',
      '--encrypt',
      ...getStampOption(),
    ])
    expect(hasMessageContaining('does not support syncing')).toBeTruthy()
  })

  it('should succeed with --sync', async () => {
    await invokeTestCli(['upload', 'README.md', '--sync', '-v', ...getStampOption()])
    expect(hasMessageContaining('Uploading was successful!')).toBeTruthy()
  })

  it('should succeed with --sync and --encrypt', async () => {
    await invokeTestCli(['upload', 'README.md', '--sync', '--encrypt', '-v', ...getStampOption()])
    expect(hasMessageContaining('Uploading was successful!')).toBeTruthy()
  })

  it('should not print double trailing slashes', async () => {
    await invokeTestCli(['upload', 'README.md', '--bee-api-url', 'http://localhost:1633/', ...getStampOption()])
    expect(hasMessageContaining(':1633/bzz')).toBeTruthy()
    expect(hasMessageContaining('//bzz')).toBeFalsy()
  })

  it('should be able to upload text file', async () => {
    await invokeTestCli(['upload', 'test/message.txt', ...getStampOption()])
    expect(consoleMessages[0]).toContain('Swarm hash')
  })
})
