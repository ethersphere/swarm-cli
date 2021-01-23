import { rootCommandClasses, optionParameters } from '../../src/config'
import { cli } from 'furious-commander'
import type { Upload } from '../../src/command/upload'

describe('Test Upload command', () => {
  let consoleMessages: string[] = []

  beforeAll(() => {
    global.console.log = jest.fn(message => {
      consoleMessages.push(message)
    })
    jest.spyOn(global.console, 'warn')
  })

  beforeEach(() => {
    //clear stored console messages
    consoleMessages = []
  })

  it('should upload testpage folder', async () => {
    const commandKey = 'upload'
    const uploadFolderPath = `${__dirname}/../testpage`
    const commandBuilder = await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [commandKey, uploadFolderPath],
    })

    expect(commandBuilder.initedCommands[0].command.name).toBe('upload')
    const command = commandBuilder.initedCommands[0].command as Upload
    expect(command.hash).toBe('8afcc8e6227b15c2983bcf1c9ff9cc5014e2806d27695ae65ea5c040ccb376ea')
    expect(consoleMessages[0]).toBe('Starting to upload the given folder')
  })

  it('should upload file', async () => {
    const commandKey = 'upload'
    const uploadFolderPath = `${__dirname}/../testpage/images/swarm.png`
    const commandBuilder = await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: [commandKey, uploadFolderPath],
    })

    expect(commandBuilder.initedCommands[0].command.name).toBe('upload')
    const command = commandBuilder.initedCommands[0].command as Upload
    expect(command.hash).toBe('f9bf592525a5cbff6f2f94ea737037af31849d553c3acf8cd586411b13568a39')
    expect(consoleMessages[0]).toBe('Starting to upload the given file')
  })
})
