import { System, Types } from 'cafe-utility'
import inquirer from 'inquirer'
import { Buy } from '../../src/command/stamp/buy'
import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

describeCommand(
  'Test Stamp command',
  ({ consoleMessages, getLastMessage, getNthLastMessage, hasMessageContaining }) => {
    it('should list stamps', async () => {
      await invokeTestCli(['stamp', 'list'])
      const pattern = [['Stamp ID'], ['Usage'], ['Capacity'], ['TTL']]
      expect(consoleMessages).toMatchLinesInOrder(pattern)
    })

    it('should show a specific stamp', async () => {
      await invokeTestCli(['stamp', 'show', Types.asString(process.env.TEST_STAMP)])
      const pattern = [['Stamp ID', Types.asString(process.env.TEST_STAMP)], ['Usage'], ['Capacity'], ['TTL']]
      expect(consoleMessages).toMatchLinesInOrder(pattern)
    })

    it('should not allow buying stamp with amount 0', async () => {
      await invokeTestCli(['stamp', 'buy', '--amount', '0', '--depth', '20'])
      expect(getLastMessage()).toContain('[amount] must be at least 1')
      await System.sleepMillis(11_000)
    })

    it('should not allow buying stamp with depth 16', async () => {
      await invokeTestCli(['stamp', 'buy', '--amount', '1', '--depth', '16'])
      expect(getLastMessage()).toContain('[depth] must be at least 17')
      await System.sleepMillis(11_000)
    })

    it('should buy stamp', async () => {
      await invokeTestCli(['stamp', 'buy', '--amount', '600_000_000', '--depth', '20', '--yes'])
      expect(getLastMessage()).toContain('Stamp ID:')
      await System.sleepMillis(11_000)
    })

    it('should buy stamp with immutable flag', async () => {
      const execution = await invokeTestCli([
        'stamp',
        'buy',
        '--amount',
        '600_000_000',
        '--depth',
        '20',
        '--immutable',
        '--wait-usable',
        '--yes',
      ])
      const command = execution.runnable as Buy

      const id = command.postageBatchId
      await invokeTestCli(['stamp', 'show', id.toHex(), '--verbose'])
      const pattern = [['Capacity (immutable)']]
      expect(consoleMessages).toMatchLinesInOrder(pattern)
      await System.sleepMillis(11_000)
    })

    it('should print custom message when there are no stamps', async () => {
      await invokeTestCli(['stamp', 'list', '--bee-api-url', 'http://localhost:11633'])
      expect(getNthLastMessage(4)).toContain('You do not have any stamps.')
    })

    it('should list with sorting and filter', async () => {
      await invokeTestCli(['stamp', 'list', '--min-usage', '0', '--max-usage', '100', '--least-used', '--limit', '1'])
      const pattern = [['Stamp ID'], ['Usage'], ['Capacity'], ['TTL']]
      expect(consoleMessages).toMatchLinesInOrder(pattern)
    })

    it('should wait until stamp is usable', async () => {
      const execution = await invokeTestCli([
        'stamp',
        'buy',
        '--depth',
        '20',
        '--amount',
        '555m',
        '--wait-usable',
        '--yes',
        '--label',
        'Alice',
      ])
      const command = execution.runnable as Buy
      expect(command.yes).toBe(true)

      const id = command.postageBatchId
      await invokeTestCli(['stamp', 'show', id.toHex(), '--verbose'])
      const pattern = [
        ['Stamp ID', id.toHex()],
        ['Label', 'Alice'],
        ['Usable', 'true'],
      ]
      expect(consoleMessages).toMatchLinesInOrder(pattern)
    })

    it('should accept estimate cost prompt', async () => {
      jest.spyOn(inquirer, 'prompt').mockClear().mockResolvedValueOnce({ value: true })
      const execution = await invokeTestCli(['stamp', 'buy', '--depth', '20', '--amount', '1b'])
      const command = execution.runnable as Buy
      expect(command.yes).toBe(true)
      expect(inquirer.prompt).toHaveBeenCalledTimes(1)
      await System.sleepMillis(11_000)
    })

    it('should reject estimate cost prompt', async () => {
      jest.spyOn(inquirer, 'prompt').mockClear().mockResolvedValueOnce({ value: false })
      const execution = await invokeTestCli(['stamp', 'buy', '--depth', '20', '--amount', '1b'])
      const command = execution.runnable as Buy
      expect(command.yes).toBe(false)
      expect(inquirer.prompt).toHaveBeenCalledTimes(1)
      await System.sleepMillis(11_000)
    })

    it('should be possible to buy with underscores and units', async () => {
      const execution = await invokeTestCli([
        'stamp',
        'buy',
        '--amount',
        '600_000K',
        '--depth',
        '17',
        '--gas-price',
        '100_000_000',
        '--yes',
      ])
      const command = execution.runnable as Buy
      expect(command.yes).toBe(true)
      expect(getLastMessage()).toContain('Stamp ID:')
      await System.sleepMillis(11_000)
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
        '--yes',
      ])
      const command = execution.runnable as Buy
      expect(command.yes).toBe(true)
      const { postageBatchId } = command
      consoleMessages.length = 0
      await invokeTestCli(['stamp', 'dilute', '--stamp', postageBatchId.toHex(), '--depth', '18'])
      expect(hasMessageContaining('This postage stamp already has depth 19. The new value must be higher.')).toBe(true)
      consoleMessages.length = 0
      await invokeTestCli(['stamp', 'dilute', '--stamp', postageBatchId.toHex(), '--depth', '19'])
      expect(hasMessageContaining('This postage stamp already has depth 19. The new value must be higher.')).toBe(true)
      consoleMessages.length = 0
      await invokeTestCli(['stamp', 'dilute', '--stamp', postageBatchId.toHex(), '--depth', '20'])
      expect(getNthLastMessage(3)).toContain('Dilute finished')
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
        '--yes',
      ])
      const command = execution.runnable as Buy
      expect(command.yes).toBe(true)
      const { postageBatchId } = command
      consoleMessages.length = 0
      await invokeTestCli(['stamp', 'topup', '--stamp', postageBatchId.toHex(), '--amount', '1k'])
      expect(getNthLastMessage(3)).toContain('Topup finished')
    })
  },
)
