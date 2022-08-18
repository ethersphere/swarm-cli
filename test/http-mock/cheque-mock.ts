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

    if (request.url === '/health') {
      response.end(JSON.stringify(health))
    }

    if (request.url === '/topology') {
      response.end(JSON.stringify(topology))
    }

    if (request.url === '/chequebook/cheque') {
      response.end(JSON.stringify(lastCheques))
    }

    if (request.url === '/chequebook/balance') {
      response.end(JSON.stringify(balance))
    }

    if (request.url === '/wallet') {
      response.end(JSON.stringify(wallet))
    }

    if (request.url === '/chequebook/cashout/1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad') {
      response.end(JSON.stringify(lastCashoutCheque1))
    }

    if (request.url === '/node') {
      response.end(JSON.stringify(nodeInfo))
    }
  })
  server.listen(port)

  return server
}

const health = { status: 'ok', version: '0.5.3-acbd0e2' }

const topology = {
  population: 1,
  connected: 1,
  depth: 0,
}

const lastCheques = {
  lastcheques: [
    {
      peer: '1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad',
      lastreceived: {
        beneficiary: '0x1A66fd26F38819A96CA24404eA50A601Fa1Cb0c3',
        chequebook: '0x7789F00C8cc0Aaa10D2fC50d9c7d74383fD9AA4d',
        payout: 8944000000000,
      },
      lastsent: {
        beneficiary: '0xe9dF78C7bd5162F93535657E7405143F2E9Cc260',
        chequebook: '0x4f16B90D43aa1f9fd3c2fe17DACD9b21417A4134',
        payout: 8293000000000,
      },
    },
  ],
}

const lastCashoutCheque1 = {
  peer: '1105536d0f270ecaa9e6e4347e687d1a1afbde7b534354dfd7050d66b3c0faad',
  chequebook: '0x7789f00c8cc0aaa10d2fc50d9c7d74383fd9aa4d',
  uncashedAmount: 8944000000000,
  beneficiary: '0x1a66fd26f38819a96ca24404ea50a601fa1cb0c3',
  transactionHash: '0x11df9811dc8caaa1ff4389503f2493a8c46b30c0a0b5f8aa54adbb965374c0ae',
  result: { recipient: '0x4f16b90d43aa1f9fd3c2fe17dacd9b21417a4134', lastPayout: 0, bounced: false },
}

const balance = { totalBalance: 100026853000000000, availableBalance: 100018560000000000 }

const wallet = {
  bzz: '3904697022414848',
  xDai: '96106482372132023',
  chainID: 100,
  contractAddress: '0xb48b45c9254c98a122bd42d0f674318ba154e071',
}

const nodeInfo = {
  beeMode: 'light',
  gatewayMode: true,
}

if (process.argv[2] === 'run') {
  createChequeMockHttpServer(parseInt(process.argv[3], 10))
}
