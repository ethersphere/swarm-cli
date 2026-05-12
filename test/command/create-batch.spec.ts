import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

describeCommand('Test `utility create-batch` command', ({ consoleMessages }) => {
  it('should create batch', async () => {
    process.env.SWARM_CLI_NETWORK_ID = '4020'
    process.env.SWARM_CLI_BZZ_ADDRESS = '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab'
    process.env.SWARM_CLI_POSTAGE_STAMP_ADDRESS = '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B'
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
      'http://localhost:9545',
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
