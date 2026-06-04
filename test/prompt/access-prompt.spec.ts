import inquirer from 'inquirer'
import { describeCommand, invokeTestCli } from '../utility'
import { getOrBuyStamp } from '../utility/stamp'

describeCommand('Test Access command prompt', () => {
  describe('when stamp missing at init', () => {
    it('should prompt for picking stamp', async () => {
      const stampId = await getOrBuyStamp()
      jest.spyOn(inquirer, 'prompt').mockClear().mockResolvedValueOnce({ value: stampId })
      await invokeTestCli(['access', 'init', '-n', 'test-access-prompt'])
      expect(inquirer.prompt).toHaveBeenCalledWith({
        message: 'Please select a stamp for this action',
        name: 'value',
        prefix: expect.any(String),
        type: 'list',
        loop: false,
        choices: expect.arrayContaining([expect.stringContaining(stampId.toString())]),
      })
    })
  })
})
