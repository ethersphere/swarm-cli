import { getFieldOrNull } from '.'
import { printer } from '../printer'

export interface BeeErrorOptions {
  notFoundMessage?: string
}

function hasStatusCode(error: unknown, statusCode: number): boolean {
  return getFieldOrNull(error, 'status') === statusCode
}

function isNotFoundError(error: unknown): boolean {
  return hasStatusCode(error, 404)
}

function isInternalServerError(error: unknown): boolean {
  return hasStatusCode(error, 500)
}

export function handleError(error: unknown, options?: BeeErrorOptions): void {
  // grab error.message, or error if it is a string
  const message: string | null = typeof error === 'string' && error ? error : getFieldOrNull(error, 'message')

  // write custom message for 500
  if (isInternalServerError(error)) {
    printer.printError('Bee responded with HTTP 500 (Internal Server Error).')

    if (!isGenericErrorPattern('Internal Server Error', message)) {
      printer.printError('')
      printer.printError('The error message is: ' + message)
    }
    // write custom message for 404
  } else if (isNotFoundError(error)) {
    printer.printError('Bee responded with HTTP 404 (Not Found).')

    if (options?.notFoundMessage || !isGenericErrorPattern('Not Found', message)) {
      printer.printError('')
      printer.printError('The error message is: ' + (options?.notFoundMessage || message))
    }
    // print 'command failed' message with error message if available
  } else if (message) {
    printer.printError('The command failed with error message: ' + message)
  } else {
    printer.printError('The command failed, but there is no error message available.')
  }

  // print 'check bee logs' message
  if (message) {
    printer.printError('')
    printer.printError('There may be additional information in the Bee logs.')
  } else {
    printer.printError('')
    printer.printError('Check your Bee log to learn if your request reached the node.')
  }
}

function isGenericErrorPattern(errorName: string, message: string | unknown): boolean {
  if (!message || typeof message !== 'string') {
    return true
  }

  errorName = errorName.toLowerCase()
  message = message.toLowerCase()

  // also handles Internal Server Error: Internal Server Error message pattern
  return message === errorName || message === `${errorName}: ${errorName}`
}
