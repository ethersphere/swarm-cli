import { BeeRequest } from '@ethersphere/bee-js'
import { printer } from './printer'

export function printCurlCommand(request: BeeRequest): void {
  const params = Object.entries(request.params || {}).filter(([, v]) => v !== undefined)
  const headers = Object.entries(request.headers || {})
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(' ')
  const queryParameters = new URLSearchParams(params as string[][]).toString()
  const queryString = queryParameters ? '?' + queryParameters : ''
  const methodString = request.method.toUpperCase() === 'GET' ? '' : ` -X ${request.method?.toUpperCase()}`
  const command = `curl${methodString} ${request.url}${queryString} ${headers}`
  printer.print(command)
}
