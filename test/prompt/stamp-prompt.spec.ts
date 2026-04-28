import chalk from 'chalk'
import inquirer from 'inquirer'
import { describeCommand, invokeTestCli } from '../utility'
import { createKeyValue } from '../../src/utils/text'

describeCommand('Postage stamp price estimation prompt', ({ consoleMessages }) => {
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
