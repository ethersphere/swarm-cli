import chalk from 'chalk'
import inquirer from 'inquirer'
import { describeCommand, invokeTestCli } from '../utility'

describeCommand('Postage stamp price estimation prompt', ({ consoleMessages }) => {
  it('stamp buy should prompt for price confirmation', async () => {
    jest.spyOn(inquirer, 'prompt').mockResolvedValueOnce({ value: 'n' })
    await invokeTestCli(['stamp', 'buy', '--depth', '24', '--amount', '596046400'])
    expect(consoleMessages[0]).toBe('Estimated cost: 1.000 xBZZ')
    expect(consoleMessages[1]).toBe('Estimated capacity: 64.000 GB')
    expect(consoleMessages[2]).toBe('Estimated TTL: Infinity weeks')
    expect(inquirer.prompt).toHaveBeenCalledWith({
      message: 'Confirm the purchase',
      name: 'value',
      prefix: chalk.bold.cyan('?'),
      type: 'confirm',
    })
  })
})
