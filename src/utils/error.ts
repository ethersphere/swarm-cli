import { ErrorWithStatus } from './types'

export function isNotFoundError(error: ErrorWithStatus): boolean {
  if (error.status === 404) {
    return true
  }

  return error.message.includes('Not Found')
}
