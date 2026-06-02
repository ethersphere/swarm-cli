import inquirer from 'inquirer'
import { describeCommand, invokeTestCli } from '../utility'
import { existsSync } from 'fs'
import { getStampOption } from '../utility/stamp'
import chalk from 'chalk'

async function uploadTestFile() {
  const uploadFilePath = `${__dirname}/../testpage/images/swarm.png`
  await invokeTestCli(['upload', uploadFilePath, ...getStampOption()])
}

describeCommand(
  'Using History Disable Command with Prompts',
  ({ configFolderPath, getLastMessage, hasMessageContaining }) => {
    it('history disables asks whether the file should be deleted', async () => {
      await invokeTestCli(['history', 'enable'])
      await uploadTestFile()
      // user presses 'n' to not delete the history file
      jest.spyOn(inquirer, 'prompt').mockClear().mockResolvedValueOnce({ value: false })
      await invokeTestCli(['history', 'disable'])

      expect(hasMessageContaining('Upload history tracking disabled')).toBe(true)
      expect(existsSync(`${configFolderPath}/history-prompt-upload-history.json`)).toEqual(true)
      expect(inquirer.prompt).toHaveBeenCalledWith({
        message: 'Do you want to delete the upload history file? This action cannot be undone.',
        name: 'value',
        prefix: chalk.bold.cyan('?'),
        type: 'confirm',
      })
      await invokeTestCli(['history', 'disable', '--yes'])
    })

    describe('when history tracking is re-enabled', () => {
      it('should not overwrite existing history file', async () => {
        await invokeTestCli(['history', 'enable'])
        await uploadTestFile()
        jest.spyOn(inquirer, 'prompt').mockClear().mockResolvedValueOnce({ value: false })
        await invokeTestCli(['history', 'disable'])
        await invokeTestCli(['history', 'enable'])
        await invokeTestCli(['history', 'status'])
        expect(getLastMessage()).toEqual('Number of history entries: 1')
        await invokeTestCli(['history', 'disable', '--yes'])
      })
    })
  },
  { configFileName: 'history-prompt' },
)
