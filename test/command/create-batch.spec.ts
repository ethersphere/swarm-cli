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
      '0x566058308ad5fa3888173c741a1fb902c9f1f19559b11fc2738dfc53637ce4e9',
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
