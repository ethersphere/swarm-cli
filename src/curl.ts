import { BeeRequest } from '@ethersphere/bee-js'
import chalk from 'chalk'
import { printer } from './printer'

interface CurlStore {
  path: string
  type: 'buffer' | 'stream'
  folder: boolean
}

const curlStore: CurlStore = {
  path: '',
  type: 'buffer',
  folder: false,
}

export function setCurlStore(props: CurlStore): void {
  curlStore.path = props.path
  curlStore.type = props.type
  curlStore.folder = props.folder
}

export function printCurlCommand(request: BeeRequest): void {
  const params = Object.entries(request.params || {}).filter(([, v]) => v !== undefined)
  const headers = getHeadersString(request)
  const queryParameters = new URLSearchParams(params as string[][]).toString()
  const queryString = queryParameters ? '?' + queryParameters : ''
  const methodString = request.method.toUpperCase() === 'GET' ? '' : ` -X ${request.method?.toUpperCase()}`
  const dataString = getDataString(request)
  const command = chalk.cyan(`curl${methodString} "${request.url}${queryString}" ${headers}${dataString}`)
  printer.print(command)
}

function getHeadersString(request: BeeRequest): string {
  return Object.entries(request.headers || {})
    .filter(entry => String(entry[0]).toLowerCase() !== 'content-length')
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(' ')
}

function getDataString(request: BeeRequest): string {
  if (!curlStore.path || request.method.toUpperCase() !== 'POST' || !request.url.includes('/bzz')) {
    return ''
  }

  if (curlStore.folder) {
    return ` --data <${curlStore.type}>`
  }

  return ' --data @' + curlStore.path
}
