import { ErrorWithStatus } from './types'

export function isNotFoundError(error: ErrorWithStatus): boolean {
  return error.status === 404 || error.message.includes('Not Found')
}

export function isInternalServerError(error: ErrorWithStatus): boolean {
  return error.status === 500 || error.message.includes('Internal Server Error')
}
