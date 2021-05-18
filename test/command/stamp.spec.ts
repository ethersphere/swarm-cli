import { cli } from 'furious-commander'
import { optionParameters, rootCommandClasses } from '../../src/config'

describe('Test Stamp command', () => {
  const consoleMessages: string[] = []
  const getLastMessage = () => consoleMessages[consoleMessages.length - 1]

  beforeAll(() => {
    global.console.log = jest.fn(message => {
      consoleMessages.push(message)
    })
    global.console.error = jest.fn(message => {
      consoleMessages.push(message)
    })
  })

  beforeEach(() => {
    consoleMessages.length = 0
  })

  it('should list stamps', async () => {
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['stamp', 'list'],
    })
    expect(consoleMessages[1]).toContain('Batch ID:')
    expect(consoleMessages[2]).toContain('Utilization:')
  })

  it('should show a specific stamp', async () => {
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['stamp', 'show', process.env.STAMP || ''],
    })
    expect(consoleMessages[1]).toContain('Batch ID:')
    expect(consoleMessages[1]).toContain(process.env.STAMP)
    expect(consoleMessages[2]).toContain('Utilization:')
  })

  it('should not allow buying stamp with amount 0', async () => {
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['stamp', 'buy', '--amount', '0', '--depth', '20'],
    })
    expect(getLastMessage()).toContain('[amount] must be at least 1')
  })

  it('should not allow buying stamp with depth 16', async () => {
    await cli({
      rootCommandClasses,
      optionParameters,
      testArguments: ['stamp', 'buy', '--amount', '1', '--depth', '16'],
    })
    expect(getLastMessage()).toContain('[depth] must be at least 17')
  })
})
