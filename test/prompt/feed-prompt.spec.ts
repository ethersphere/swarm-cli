import inquirer from 'inquirer'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describeCommand(
  'Using Feed Commands with Prompts',
  ({ consoleMessages, getNthLastMessage, getLastMessage }) => {
    it('feed upload should prompt for stamp, identity and password', async () => {
      await invokeTestCli(['identity', 'create', 'main', '-P', 'secret'])
      jest
        .spyOn(inquirer, 'prompt')
        .mockClear()
        .mockResolvedValueOnce({ value: getStampOption()[1] })
        .mockResolvedValueOnce({ value: 'main' })
        .mockResolvedValueOnce({ value: 'secret' })
      await invokeTestCli(['feed', 'upload', '-v', 'README.md'])
      expect(inquirer.prompt).toHaveBeenCalledTimes(3)
      expect(getLastMessage()).toContain('Successfully uploaded to feed.')
    })

    it('feed upload should prompt for identity when it is misspelled', async () => {
      jest.spyOn(inquirer, 'prompt').mockClear().mockResolvedValueOnce({ value: 'main' })
      await invokeTestCli(['feed', 'upload', '-v', 'README.md', '-i', '_main', '-P', 'secret', ...getStampOption()])
      expect(inquirer.prompt).toHaveBeenCalledTimes(1)
      expect(getLastMessage()).toContain('Successfully uploaded to feed.')
    })

    it('feed upload should prompt for password when it is not given', async () => {
      jest.spyOn(inquirer, 'prompt').mockClear().mockResolvedValueOnce({ value: 'secret' })
      await invokeTestCli(['feed', 'upload', '-v', 'README.md', '-i', 'main', ...getStampOption()])
      expect(inquirer.prompt).toHaveBeenCalledTimes(1)
      expect(getLastMessage()).toContain('Successfully uploaded to feed.')
    })

    it('feed upload should fail when running in quiet mode and stamp is missing', async () => {
      await invokeTestCli(['feed', 'upload', '-q', 'README.md', '-i', 'main', '-P', 'secret'])
      expect(getLastMessage()).toContain('Required option not provided: --stamp')
    })

    it('feed upload should fail when running in quiet mode and identity is missing', async () => {
      await invokeTestCli(['feed', 'upload', '-q', 'README.md', '-P', 'secret', ...getStampOption()])
      expect(getLastMessage()).toContain('Required option not provided: --identity')
    })

    it('feed upload should fail when running in quiet mode and identity is misspelled', async () => {
      await invokeTestCli(['feed', 'upload', '-q', 'README.md', '-i', '_main', '-P', 'secret', ...getStampOption()])
      expect(getNthLastMessage(4)).toContain('The provided identity does not exist.')
    })

    it('feed upload should fail when running in quiet mode and password is wrong', async () => {
      await invokeTestCli(['feed', 'upload', '-q', 'README.md', '-i', 'main', '-P', '_secret', ...getStampOption()])
      expect(getNthLastMessage(3)).toContain('Key derivation failed - possibly wrong passphrase')
    })

    it('feed upload should fail when running in quiet mode and password is missing', async () => {
      await invokeTestCli(['feed', 'upload', '-q', 'README.md', '-i', 'main', ...getStampOption()])
      expect(consoleMessages[0]).toContain('Password must be passed with the --password option in quiet mode')
    })
  },
  { configFileName: 'feed-prompt' },
)
