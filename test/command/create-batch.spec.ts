import { mintBzzTransaction } from '../../src/utils/rpc'
import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

const DEPLOYER_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const DEPLOYER_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const JSON_RPC_URL = 'http://localhost:8545'
const BZZ_10 = 100_000_000_000_000_000n.toString()

describeCommand('Test `utility create-batch` command', ({ consoleMessages }) => {
  it('should create batch', async () => {
    process.env.SWARM_CLI_NETWORK_ID = '1337'
    process.env.SWARM_CLI_BZZ_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    process.env.SWARM_CLI_POSTAGE_STAMP_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    await mintBzzTransaction(DEPLOYER_KEY, DEPLOYER_ADDRESS, BZZ_10, JSON_RPC_URL)
    await invokeTestCli([
      'utility',
      'create-batch',
      '--private-key',
      DEPLOYER_KEY,
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
