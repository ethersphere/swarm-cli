import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

describeCommand('Test `utility create-batch` command', ({ consoleMessages }) => {
  it('should create batch', async () => {
    await invokeTestCli([
      'utility',
      'create-batch',
      '--private-key',
      '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
      '--depth',
      '17',
      '--amount',
      '10B',
      '--json-rpc-url',
      'http:s://localhost:9545',
      '--yes',
    ])
    expect(consoleMessages).toMatchLinesInOrder([
      ['Approving spending of', 'BZZ to'],
      ['Waiting 3 blocks on approval tx'],
      ['Creating postage batch for', 'with depth 17 and amount 100000000000'],
      ['Waiting 3 blocks on create batch tx'],
      ['Batch created with ID'],
    ])
  })
})
