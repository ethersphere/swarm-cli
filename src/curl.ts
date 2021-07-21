import { BeeRequest, Utils } from '@ethersphere/bee-js'
import { Readable } from 'stream'
import { printer } from './printer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isReadable(x: any): x is Readable {
  return typeof x?.read === 'function'
}

const getDataString = (data?: unknown): string | null => {
  if (typeof data === 'string') {
    return data
  }

  if (isReadable(data)) {
    return '<stream>'
  }

  return null
}

function printCurlCommand(request: BeeRequest): BeeRequest {
  const headers = Object.entries(request.headers || {})
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(' ')
  const queryParameters = new URLSearchParams(request.params as Record<string, string>).toString()
  const queryString = queryParameters ? '?' + queryParameters : ''
  const methodString = request.method.toUpperCase() === 'GET' ? '' : ` -X ${request.method?.toUpperCase()}`
  const dataString = request.data ? ` --data "${getDataString(request.data)}"` : ''
  const command = `curl${methodString} ${request.url}${queryString} ${headers}${dataString}`
  printer.print(command)

  return request
}

export function registerCurlHook(): void {
  Utils.Hooks.onRequest(printCurlCommand)
}
