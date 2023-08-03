import chalk from 'chalk'
import inquirer from 'inquirer'
import { describeCommand, invokeTestCli } from '../utility'

describeCommand('Postage stamp price estimation prompt', ({ consoleMessages }) => {
  it('stamp buy should prompt for price confirmation', async () => {
    jest.spyOn(inquirer, 'prompt').mockResolvedValueOnce({ value: 'n' })
    await invokeTestCli(['stamp', 'buy', '--depth', '24', '--amount', '596046400'])
    expect(consoleMessages[0]).toBe('The estimated cost is 0.9999 BZZ, expected capacity is at most 64.00 GB')
    expect(inquirer.prompt).toHaveBeenCalledWith({
      message: 'Confirm the purchase',
      name: 'value',
      prefix: chalk.bold.cyan('?'),
      type: 'confirm',
    })
  })
})
