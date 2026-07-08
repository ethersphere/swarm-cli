import chalk from 'chalk'
import inquirer from 'inquirer'
import { createKeyValue } from '../../src/utils/text'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describeCommand('Postage stamp prompt', ({ consoleMessages, getNthLastMessage }) => {
  describe('Price estimation', () => {
    it('stamp buy should prompt for price confirmation', async () => {
      jest.spyOn(inquirer, 'prompt').mockResolvedValueOnce({ value: false })
      await invokeTestCli(['stamp', 'buy', '--depth', '24', '--amount', '596046400'])
      expect(consoleMessages[0]).toBe(createKeyValue('Estimated cost', '0.9999999198822400 xBZZ'))
      expect(consoleMessages[1]).toBe(createKeyValue('Estimated capacity', '40.084 GB'))
      expect(consoleMessages[2]).toBe(createKeyValue('Estimated TTL', '34 hours'))
      expect(inquirer.prompt).toHaveBeenCalledWith({
        message: 'Confirm the purchase',
        name: 'value',
        prefix: chalk.bold.cyan('?'),
        type: 'confirm',
      })
    })
  })

  describe('Rename postage stamp', () => {
    it('should prompt for new name', async () => {
      jest.spyOn(inquirer, 'prompt').mockResolvedValueOnce({ value: 'new-stamp-name' })
      await invokeTestCli(['stamp', 'rename', ...getStampOption()])
      expect(getNthLastMessage(2)).toContain(
        `Postage stamp ${getStampOption()[1]} has been successfully renamed to 'new-stamp-name'`,
      )
      expect(inquirer.prompt).toHaveBeenCalledWith({
        message: 'Please provide a new label for the postage stamp:',
        name: 'value',
        prefix: chalk.bold.cyan('?'),
      })
    })
  })
})
