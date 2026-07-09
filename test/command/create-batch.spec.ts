import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

const FUNDER_KEY = '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba'
const JSON_RPC_URL = 'http://localhost:8545'

describeCommand('Test `utility create-batch` command', ({ consoleMessages }) => {
  it('should create batch', async () => {
    process.env.SWARM_CLI_NETWORK_ID = '1337'
    process.env.SWARM_CLI_BZZ_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    process.env.SWARM_CLI_POSTAGE_STAMP_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    await invokeTestCli([
      'utility',
      'create-batch',
      '--private-key',
      FUNDER_KEY,
      '--depth',
      '17',
      '--amount',
      '10B',
      '--json-rpc-url',
      JSON_RPC_URL,
      '--yes',
    ])
    expect(consoleMessages).toMatchLinesInOrder([
      ['Approving spending of', 'BZZ to'],
      ['Waiting 3 blocks on approval tx'],
      ['Creating postage batch for', 'with depth 17 and amount 10000000000'],
      ['Waiting 3 blocks on create batch tx'],
      ['Batch created with ID'],
    ])
  })
})
