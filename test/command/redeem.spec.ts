import { Wallet } from 'ethers'
import { sendBzzTransaction, sendNativeTransaction } from '../../src/utils/rpc'
import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

const FUNDER_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const JSON_RPC_URL = 'http://localhost:8545'
const ETH_01 = 100_000_000_000_000_000n.toString()
const BZZ_5 = 50_000_000_000_000_000n.toString()

describeCommand('Test `utility redeem` command', ({ consoleMessages }) => {
  it('should redeem funds to target address', async () => {
    process.env.SWARM_CLI_NETWORK_ID = '1337'
    process.env.SWARM_CLI_BZZ_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

    const sourceWallet = Wallet.createRandom()
    const targetWallet = Wallet.createRandom()

    await sendNativeTransaction(FUNDER_KEY, sourceWallet.address, ETH_01, JSON_RPC_URL)
    await sendBzzTransaction(FUNDER_KEY, sourceWallet.address, BZZ_5, JSON_RPC_URL)

    await invokeTestCli([
      'utility',
      'redeem',
      sourceWallet.privateKey,
      '--json-rpc-url',
      JSON_RPC_URL,
      '--target',
      targetWallet.address,
      '--yes',
    ])

    expect(consoleMessages).toMatchLinesInOrder([
      ['Target wallet address'],
      ['Creating wallet'],
      ['xBZZ balance'],
      ['xDAI balance'],
      ['Transferring xBZZ'],
      ['Refreshing xDAI balance'],
      ['Transferring xDAI'],
      ['Redeem complete'],
    ])
  }, 60_000)
})
