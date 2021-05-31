import { BeeError } from './types'

export function isNotFoundError(error: BeeError): boolean {
  return error.status === 404
}

export function isInternalServerError(error: BeeError): boolean {
  return error.status === 500
}
