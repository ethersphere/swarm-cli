import type { Upload } from '../../src/command/upload'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describeCommand('Test Upload command', () => {
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
})
