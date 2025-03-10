import {
  BeeModes,
  BZZ,
  ChainState,
  ChequebookBalanceResponse,
  DAI,
  EthAddress,
  Health,
  LastCashoutActionResponse,
  LastChequesResponse,
  NodeInfo,
  NumberString,
  Topology,
  WalletBalance,
} from '@ethersphere/bee-js'
import { createServer, Server } from 'http'

/**
 * Starts a mock HTTP server with predefined cheque responses.
 *
 * Can be run in standalone mode:
 * ts-node test/http-mock/cheque-mock.ts run 1333
 */
export function createChequeMockHttpServer(port: number): Server {
  const server = createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' })

    if (request.url === '/') {
      response.end('Ethereum Swarm Bee')
    }

    if (request.url === '/health') {
      response.end(JSON.stringify(health))
    }

    if (request.url === '/topology') {
      response.end(JSON.stringify(topology, bytesToString))
    }

    if (request.url === '/chequebook/cheque') {
      response.end(JSON.stringify(lastCheques, bytesToString))
    }

    if (request.url === '/chequebook/balance') {
      response.end(JSON.stringify(balance, bytesToString))
    }

    if (request.url === '/chainstate') {
      response.end(JSON.stringify(chainstate, bytesToString))
    }

    if (request.url === '/wallet') {
      response.end(JSON.stringify(wallet, bytesToString))
    }

    if (request.url === '/chequebook/cashout/1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad') {
      response.end(JSON.stringify(lastCashoutCheque1, bytesToString))
    }

    if (request.url === '/node') {
      response.end(JSON.stringify(nodeInfo, bytesToString))
    }

    if (request.url === '/stake') {
      response.end(
        JSON.stringify({
          stakedAmount: '0',
        }),
      )
    }
  })
  server.listen(port)

  return server
}

const health: Health = { status: 'ok', version: '2.2.0-b8405074e', apiVersion: '7.3.0' }

const topology: Topology = {
  baseAddr: '5690695034c2150a7feda6969e6223e9565871261080b5e1703a6c47a934fb18',
  population: 13168,
  connected: 153,
  timestamp: '2025-02-25T20:28:57.963845+01:00',
  nnLowWatermark: 3,
  depth: 11,
  reachability: 'Private',
  networkAvailability: 'Available',
  bins: {
    bin_0: { population: 6850, connected: 16, disconnectedPeers: [], connectedPeers: [] },
    bin_1: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_2: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_3: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_4: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_5: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_6: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_7: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_8: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_9: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_10: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_11: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_12: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_13: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_14: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_15: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_16: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_17: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_18: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_19: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_20: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_21: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_22: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_23: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_24: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_25: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_26: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_27: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_28: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_29: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_30: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
    bin_31: { population: 0, connected: 0, disconnectedPeers: [], connectedPeers: [] },
  },
}
const lastCheques: LastChequesResponse = {
  lastcheques: [
    {
      peer: '1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad',
      lastreceived: {
        beneficiary: new EthAddress('0x1A66fd26F38819A96CA24404eA50A601Fa1Cb0c3'),
        chequebook: new EthAddress('0x7789F00C8cc0Aaa10D2fC50d9c7d74383fD9AA4d'),
        payout: BZZ.fromPLUR('8944000000000'),
      },
      lastsent: {
        beneficiary: new EthAddress('0xe9dF78C7bd5162F93535657E7405143F2E9Cc260'),
        chequebook: new EthAddress('0x4f16B90D43aa1f9fd3c2fe17DACD9b21417A4134'),
        payout: BZZ.fromPLUR('8293000000000'),
      },
    },
  ],
}

const lastCashoutCheque1: LastCashoutActionResponse = {
  peer: '1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad',
  uncashedAmount: BZZ.fromPLUR('8944000000000'),
  transactionHash: '0x11df9811dc8caaa1ff4389503f2493a8c46b30c0a0b5f8aa54adbb965374c0ae',
  lastCashedCheque: {
    beneficiary: new EthAddress('0x1a66fd26f38819a96ca24404ea50a601fa1cb0c3'),
    chequebook: new EthAddress('0x7789f00c8cc0aaa10d2fc50d9c7d74383fd9aa4d'),
    payout: BZZ.fromPLUR('8944000000000'),
  },
  result: { recipient: '0x4f16b90d43aa1f9fd3c2fe17dacd9b21417a4134', lastPayout: BZZ.fromPLUR('0'), bounced: false },
}

const balance: ChequebookBalanceResponse = {
  totalBalance: BZZ.fromPLUR('100026853000000000'),
  availableBalance: BZZ.fromPLUR('100018560000000000'),
}

const chainstate: ChainState = {
  chainTip: 37439274,
  block: 37439270,
  totalAmount: '153434201871' as NumberString,
  currentPrice: 27356,
}

const wallet: WalletBalance = {
  bzzBalance: BZZ.fromPLUR('3904697022414848'),
  nativeTokenBalance: DAI.fromWei('96106482372132023'),
  chainID: 100,
  chequebookContractAddress: '0xb48b45c9254c98a122bd42d0f674318ba154e071',
  walletAddress: '0xb48b45c9254c98a122bd42d0f674318ba154e071',
}

const nodeInfo: NodeInfo = { beeMode: BeeModes.LIGHT, chequebookEnabled: true, swapEnabled: true }

function bytesToString(key: string, value: any): any {
  if (Array.isArray(value)) {
    return value.map(v => bytesToString(key, v))
  }

  if (value instanceof EthAddress) {
    return value.toString()
  }

  if (value instanceof BZZ) {
    return value.toPLURString()
  }

  if (value instanceof DAI) {
    return value.toWeiString()
  }

  if (typeof value === 'object' && value !== null) {
    const newObj: any = {}
    for (const k in value) {
      if (value.hasOwnProperty(k)) {
        newObj[k] = bytesToString(k, value[k])
      }
    }

    return newObj
  }

  return value
}

if (process.argv[2] === 'run') {
  createChequeMockHttpServer(parseInt(process.argv[3], 10))
}
