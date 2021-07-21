import { BeeRequest, Utils } from '@ethersphere/bee-js'
import { Readable } from 'stream'
import { printer } from './printer'

const getDataString = (data?: unknown): string | null => {
  if (typeof data === 'string') {
    return data
  }

  if (data instanceof Readable) {
    return '<stream>'
  }

  if (data instanceof Uint8Array) {
    return '<buffer>'
  }

  return '<unknown>'
}

function printCurlCommand(request: BeeRequest): BeeRequest {
  const params = Object.entries(request.params || {}).filter(([, v]) => v !== undefined)
  const headers = Object.entries(request.headers || {})
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(' ')
  const queryParameters = new URLSearchParams(params as string[][]).toString()
  const queryString = queryParameters ? '?' + queryParameters : ''
  const methodString = request.method.toUpperCase() === 'GET' ? '' : ` -X ${request.method?.toUpperCase()}`
  const dataString = request.data ? ` --data "${getDataString(request.data)}"` : ''
  const command = `curl${methodString} ${request.url}${queryString} ${headers}${dataString}`
  printer.print(command)

  return request
}

export function registerCurlHook(): void {
  if (typeof process.env.CURL_HOOK_ID === 'undefined') {
    process.env.CURL_HOOK_ID = String(Utils.Hooks.onRequest(printCurlCommand))
  }
}
