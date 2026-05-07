import { Buy } from '../../src/command/stamp/buy'
import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

describeCommand('Test Stamp command end-to-end', ({ consoleMessages }) => {
  it('should buy stamp with right capacity and properties', async () => {
    const execution = await invokeTestCli([
      'stamp',
      'buy',
      '--depth',
      '20',
      '--amount',
      '555m',
      '--gas-price',
      '100_000_000',
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
      ['Type', 'Immutable'],
      ['Stamp ID', id.toHex()],
      ['Label', 'Alice'],
      ['Depth', '20'],
      ['Usable', 'true'],
    ]
    expect(consoleMessages).toMatchLinesInOrder(pattern)
  })
})
