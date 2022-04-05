import inquirer from 'inquirer'
import { Buy } from '../../src/command/stamp/buy'
import { sleep } from '../../src/utils'
import { describeCommand, invokeTestCli } from '../utility'

describeCommand(
  'Test Stamp command',
  ({ consoleMessages, getLastMessage, getNthLastMessage, hasMessageContaining }) => {
    it('should list stamps', async () => {
      await invokeTestCli(['stamp', 'list'])
      expect(consoleMessages[0]).toContain('Stamp ID:')
      expect(consoleMessages[1]).toContain('Label: ')
      expect(consoleMessages[2]).toContain('Usage:')
    })

    it('should show a specific stamp', async () => {
      await invokeTestCli(['stamp', 'show', process.env.STAMP || ''])
      expect(consoleMessages[0]).toContain('Stamp ID:')
      expect(consoleMessages[0]).toContain(process.env.STAMP)
      expect(consoleMessages[1]).toContain('Label: ')
      expect(consoleMessages[2]).toContain('Usage:')
    })

    it('should not allow buying stamp with amount 0', async () => {
      await invokeTestCli(['stamp', 'buy', '--amount', '0', '--depth', '20'])
      expect(getLastMessage()).toContain('[amount] must be at least 1')
      await sleep(11_000)
    })

    it('should not allow buying stamp with depth 16', async () => {
      await invokeTestCli(['stamp', 'buy', '--amount', '1', '--depth', '16'])
      expect(getLastMessage()).toContain('[depth] must be at least 17')
      await sleep(11_000)
    })

    it('should buy stamp', async () => {
      await invokeTestCli(['stamp', 'buy', '--amount', '100000', '--depth', '20'])
      expect(getLastMessage()).toContain('Stamp ID:')
      await sleep(11_000)
    })

    it('should buy stamp with immutable flag', async () => {
      const execution = await invokeTestCli([
        'stamp',
        'buy',
        '--amount',
        '100000',
        '--depth',
        '20',
        '--immutable',
        '--wait-usable',
      ])
      const command = execution.runnable as Buy

      const id = command.postageBatchId
      await invokeTestCli(['stamp', 'show', id, '--verbose'])
      expect(getLastMessage()).toContain('Immutable')
      expect(getLastMessage()).toContain('true')
      await sleep(11_000)
    })

    it('should print custom message when there are no stamps', async () => {
      await invokeTestCli(['stamp', 'list', '--bee-debug-api-url', 'http://localhost:11635'])
      expect(getNthLastMessage(4)).toContain('You do not have any stamps.')
    })

    it('should list with sorting and filter', async () => {
      await invokeTestCli(['stamp', 'list', '--min-usage', '0', '--max-usage', '100', '--least-used', '--limit', '1'])
      expect(getLastMessage()).toContain('TTL:')
    })

    it('should wait until stamp is usable', async () => {
      const execution = await invokeTestCli(['stamp', 'buy', '--depth', '20', '--amount', '1', '--wait-usable'])
      const command = execution.runnable as Buy

      const id = command.postageBatchId
      await invokeTestCli(['stamp', 'show', id, '--verbose'])
      expect(getNthLastMessage(3)).toContain('Utilization')
      expect(getNthLastMessage(3)).toContain('0')
      expect(getNthLastMessage(4)).toContain('Usable')
      expect(getNthLastMessage(4)).toContain('true')
      expect(getNthLastMessage(9)).toContain('Usage')
      expect(getNthLastMessage(9)).toContain('0%')
      expect(getNthLastMessage(10)).toContain('Label:')
      expect(getNthLastMessage(11)).toContain('Stamp ID')
      expect(getNthLastMessage(11)).toContain(id)
    })

    it('should accept --wait-usable prompt', async () => {
      jest.spyOn(inquirer, 'prompt').mockClear().mockResolvedValueOnce({ value: true })
      const execution = await invokeTestCli(['stamp', 'buy', '--depth', '20', '--amount', '1', '--verbose'])
      const command = execution.runnable as Buy
      expect(command.waitUsable).toBe(true)
      expect(inquirer.prompt).toHaveBeenCalledTimes(1)
      await sleep(11_000)
    })

    it('should reject --wait-usable prompt', async () => {
      jest.spyOn(inquirer, 'prompt').mockClear().mockResolvedValueOnce({ value: false })
      const execution = await invokeTestCli(['stamp', 'buy', '--depth', '20', '--amount', '1', '--verbose'])
      const command = execution.runnable as Buy
      expect(command.waitUsable).toBe(false)
      expect(inquirer.prompt).toHaveBeenCalledTimes(1)
      await sleep(11_000)
    })

    it('should be possible to buy with underscores and units', async () => {
      await invokeTestCli(['stamp', 'buy', '--amount', '1_000K', '--depth', '17', '--gas-price', '100_000_000'])
      expect(getLastMessage()).toContain('Stamp ID:')
      await sleep(11_000)
    })

    it.skip('should only be able to dilute stamp with greater depth', async () => {
      const execution = await invokeTestCli([
        'stamp',
        'buy',
        '--amount',
        '1_000K',
        '--depth',
        '19',
        '--gas-price',
        '100_000_000',
        '--wait-usable',
      ])
      const command = execution.runnable as Buy
      const { postageBatchId } = command
      consoleMessages.length = 0
      await invokeTestCli(['stamp', 'dilute', '--stamp', postageBatchId, '--depth', '18'])
      expect(hasMessageContaining('This postage stamp already has depth 19. The new value must be higher.')).toBe(true)
      consoleMessages.length = 0
      await invokeTestCli(['stamp', 'dilute', '--stamp', postageBatchId, '--depth', '19'])
      expect(hasMessageContaining('This postage stamp already has depth 19. The new value must be higher.')).toBe(true)
      consoleMessages.length = 0
      await invokeTestCli(['stamp', 'dilute', '--stamp', postageBatchId, '--depth', '20'])
      expect(getNthLastMessage(2)).toContain('Depth')
      expect(getNthLastMessage(2)).toContain('20')
    })

    it.skip('should top up stamp', async () => {
      const execution = await invokeTestCli([
        'stamp',
        'buy',
        '--amount',
        '1K',
        '--depth',
        '19',
        '--gas-price',
        '100_000_000',
        '--wait-usable',
      ])
      const command = execution.runnable as Buy
      const { postageBatchId } = command
      consoleMessages.length = 0
      await invokeTestCli(['stamp', 'topup', '--stamp', postageBatchId, '--amount', '1k'])
      expect(getNthLastMessage(1)).toContain('Amount')
      expect(getNthLastMessage(1)).toContain('2000')
    })
  },
)
