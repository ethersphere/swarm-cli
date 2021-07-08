import { AxiosRequestConfig } from 'axios'
import { Readable } from 'stream'
import { printer } from './printer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isReadable(x: any): x is Readable {
  return typeof x?.read === 'function'
}

const getDataString = (data?: string | Readable): string | null => {
  if (typeof data === 'string') {
    return data
  }

  if (isReadable(data)) {
    return '<stream>'
  }

  return null
}

export function printCurlCommand(request: AxiosRequestConfig): AxiosRequestConfig {
  const headers = Object.entries(request.headers)
    .filter(([key]) => !['common', 'delete', 'get', 'head', 'patch', 'post', 'put'].includes(key))
    .map(([key, value]) => `-H "${key}:${value}"`)
    .join(' ')

  const methodString = request.method === 'get' ? '' : ` -X ${request.method?.toUpperCase()}`
  const dataString = request.data ? ` --data "${getDataString(request.data)}"` : ''

  const command = `curl ${request.url}${methodString} ${headers}${dataString}`

  printer.print(command)

  return request
}
