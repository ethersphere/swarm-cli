import inquirer from 'inquirer'
import { describeCommand, invokeTestCli } from '../utility'
import { existsSync } from 'fs'
import { getStampOption } from '../utility/stamp'
import chalk from 'chalk'

describeCommand('Using History Disable Command with Prompts', ({ consoleMessages, configFolderPath }) => {
  it('histroy disables asks whether the file should be deleted', async () => {
    await invokeTestCli(['history', 'enable'])
    const uploadFilePath = `${__dirname}/../testpage/images/swarm.png`
    await invokeTestCli(['upload', uploadFilePath, ...getStampOption()])
    // user presses 'n' to not delete the history file
    jest.spyOn(inquirer, 'prompt').mockClear().mockResolvedValueOnce({ value: false })
    await invokeTestCli(['history', 'disable'])

    expect(consoleMessages[6]).toEqual('Upload history tracking disabled')
    expect(existsSync(`${configFolderPath}/upload-history.json`)).toEqual(true)
    expect(inquirer.prompt).toHaveBeenCalledWith({
      message: 'Do you want to delete the upload history file? This action cannot be undone.',
      name: 'value',
      prefix: chalk.bold.cyan('?'),
      type: 'confirm',
    })
  })
})
