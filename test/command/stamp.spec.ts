import inquirer from 'inquirer'
import { Buy } from '../../src/command/stamp/buy'
import { describeCommand, invokeTestCli } from '../utility'

describeCommand('Test Stamp command', ({ consoleMessages, getLastMessage, getNthLastMessage }) => {
  it('should list stamps', async () => {
    await invokeTestCli(['stamp', 'list'])
    expect(consoleMessages[0]).toContain('Stamp ID:')
    expect(consoleMessages[1]).toContain('Usage:')
  })

  it('should show a specific stamp', async () => {
    await invokeTestCli(['stamp', 'show', process.env.STAMP || ''])
    expect(consoleMessages[0]).toContain('Stamp ID:')
    expect(consoleMessages[0]).toContain(process.env.STAMP)
    expect(consoleMessages[1]).toContain('Usage:')
  })

  it('should not allow buying stamp with amount 0', async () => {
    await invokeTestCli(['stamp', 'buy', '--amount', '0', '--depth', '20'])
    expect(getLastMessage()).toContain('[amount] must be at least 1')
  })

  it('should not allow buying stamp with depth 16', async () => {
    await invokeTestCli(['stamp', 'buy', '--amount', '1', '--depth', '16'])
    expect(getLastMessage()).toContain('[depth] must be at least 17')
  })

  it('should buy stamp', async () => {
    await invokeTestCli(['stamp', 'buy', '--amount', '100000', '--depth', '20'])
    expect(getLastMessage()).toContain('Stamp ID:')
  })

  it('should print custom message when there are no stamps', async () => {
    await invokeTestCli(['stamp', 'list', '--bee-api-url', 'http://localhost:11633'])
    expect(getNthLastMessage(3)).toContain('You do not have any stamps.')
  })

  it('should list with sorting and filter', async () => {
    await invokeTestCli(['stamp', 'list', '--min-usage', '0', '--max-usage', '100', '--least-used', '--limit', '1'])
    expect(getLastMessage()).toContain('Usage:')
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
    expect(getNthLastMessage(8)).toContain('Usage')
    expect(getNthLastMessage(8)).toContain('0%')
    expect(getNthLastMessage(9)).toContain('Stamp ID')
    expect(getNthLastMessage(9)).toContain(id)
  })

  it('should accept --wait-usable prompt', async () => {
    jest.spyOn(inquirer, 'prompt').mockClear().mockResolvedValueOnce({ value: true })
    const execution = await invokeTestCli(['stamp', 'buy', '--depth', '20', '--amount', '1', '--verbose'])
    const command = execution.runnable as Buy
    expect(command.waitUsable).toBe(true)
    expect(inquirer.prompt).toHaveBeenCalledTimes(1)
  })

  it('should reject --wait-usable prompt', async () => {
    jest.spyOn(inquirer, 'prompt').mockClear().mockResolvedValueOnce({ value: false })
    const execution = await invokeTestCli(['stamp', 'buy', '--depth', '20', '--amount', '1', '--verbose'])
    const command = execution.runnable as Buy
    expect(command.waitUsable).toBe(false)
    expect(inquirer.prompt).toHaveBeenCalledTimes(1)
  })
})
