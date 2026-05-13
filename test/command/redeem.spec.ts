import { Wallet } from 'ethers'
import { sendBzzTransaction, sendNativeTransaction } from '../../src/utils/rpc'
import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'

expect.extend({
  toMatchLinesInOrder,
})

const FUNDER_KEY = '0x566058308ad5fa3888173c741a1fb902c9f1f19559b11fc2738dfc53637ce4e9'
const JSON_RPC_URL = 'http://localhost:9545'
const ETH_01 = (100_000_000_000_000_000n).toString()
const BZZ_5 = (50_000_000_000_000_000n).toString()

describeCommand('Test `utility redeem` command', ({ consoleMessages }) => {
  it(
    'should redeem funds to target address',
    async () => {
      process.env.SWARM_CLI_NETWORK_ID = '4020'
      process.env.SWARM_CLI_BZZ_ADDRESS = '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab'

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
    },
    60_000,
  )
})
