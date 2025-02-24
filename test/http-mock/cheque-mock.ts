import { createServer, Server } from 'http'
import { Topology, LastChequesResponse, EthAddress, BZZ, LastCashoutActionResponse, ChequebookBalanceResponse, ChainState, NumberString, WalletBalance, DAI, NodeInfo, BeeModes } from '@upcoming/bee-js'

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
      response.end(JSON.stringify(convertToJSON(health)))
    }

    if (request.url === '/topology') {
      response.end(JSON.stringify(convertToJSON(topology)))
    }

    if (request.url === '/chequebook/cheque') {
      response.end(JSON.stringify(convertToJSON(lastCheques)))
    }

    if (request.url === '/chequebook/balance') {
      response.end(JSON.stringify(convertToJSON(balance)))
    }

    if (request.url === '/chainstate') {
      response.end(JSON.stringify(convertToJSON(chainstate)))
    }

    if (request.url === '/wallet') {
      response.end(JSON.stringify(convertToJSON(wallet)))
    }

    if (request.url === '/chequebook/cashout/1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad') {
      response.end(JSON.stringify(convertToJSON(lastCashoutCheque1)))
    }

    if (request.url === '/node') {
      response.end(JSON.stringify(convertToJSON(nodeInfo)))
    }

    if (request.url === '/stake') {
      response.end(
        JSON.stringify({
          stakedAmount: '0',
        }),
      )
    }
  })
  try {
  server.listen(port)
  }
  catch (e) {
    console.error(e)
  }
  
  return server
}

function convertToJSON(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertToJSON)
  } else if (obj && typeof obj === 'object') {
    const result: any = {}
    for (const key of Object.keys(obj)) {
      const value = obj[key]
      switch (true) {
        case value instanceof EthAddress:
          result[key] = value.toString()
          break
        case value instanceof BZZ:
          result[key] = value.toPLURString()
          break
        case value instanceof DAI:
          result[key] = value.toWeiString()
          break
        default:
          result[key] = convertToJSON(value)
      }
    }
    return result
  }
  return obj
}

const health = { status: 'ok', version: '0.5.3-acbd0e2' }

const topology: Partial<Topology> = {
  population: 1,
  connected: 1,
  depth: 0,
}

const lastCheques: LastChequesResponse = {
  lastcheques: [
    {
      peer: '1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad',
      lastreceived: {
        beneficiary: new EthAddress('0x1A66fd26F38819A96CA24404eA50A601Fa1Cb0c3'),
        chequebook: new EthAddress('0x7789F00C8cc0Aaa10D2fC50d9c7d74383fD9AA4d'),
        payout: BZZ.fromPLUR('133700000000000000'),
      },
      lastsent: {
        beneficiary: new EthAddress('0xe9dF78C7bd5162F93535657E7405143F2E9Cc260'),
        chequebook: new EthAddress('0x4f16B90D43aa1f9fd3c2fe17DACD9b21417A4134'),
        payout: BZZ.fromPLUR('133700000000000000'),
      },
    },
  ],
}

const lastCashoutCheque1: LastCashoutActionResponse = {
  peer: '1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad',
  lastCashedCheque: {
    beneficiary: new EthAddress( '0x1a66fd26f38819a96ca24404ea50a601fa1cb0c3'),
    chequebook: new EthAddress( '0x7789f00c8cc0aaa10d2fc50d9c7d74383fd9aa4d'),
    payout: BZZ.fromDecimalString('0'),
  },
  uncashedAmount: BZZ.fromPLUR('8944000000000'),
  transactionHash: '0x11df9811dc8caaa1ff4389503f2493a8c46b30c0a0b5f8aa54adbb965374c0ae',
  result: { recipient: '0x4f16b90d43aa1f9fd3c2fe17dacd9b21417a4134', lastPayout: BZZ.fromDecimalString('0'), bounced: false },
}

const balance: ChequebookBalanceResponse = {
  totalBalance: BZZ.fromPLUR('100026853000000000'),
  availableBalance: BZZ.fromPLUR('100018560000000000'),
 }

const chainstate: ChainState = {
  chainTip: 37439274,
  block: 37439270,
  totalAmount: '153434201871' as NumberString,
  currentPrice: '27356' as NumberString,
}

const wallet: WalletBalance = {
  bzzBalance: BZZ.fromPLUR('3904697022414848'),
  nativeTokenBalance: DAI.fromWei('96106482372132023'),
  chainID: 100,
  chequebookContractAddress: '0xb48b45c9254c98a122bd42d0f674318ba154e071',
  walletAddress: '0xb48b45c9254c98a122bd42d0f674318ba154e071',
}

const nodeInfo: NodeInfo = {
  beeMode: BeeModes.LIGHT,
  chequebookEnabled: true,
  swapEnabled: true,
}

if (process.argv[2] === 'run') {
  createChequeMockHttpServer(parseInt(process.argv[3], 10))
}
