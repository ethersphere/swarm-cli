import { getFieldOrNull } from '.'
import { FORMATTED_ERROR } from '../command/root-command/printer'
import { printer } from '../printer'

/**
 * Thrown when the error is not related to Bee/network
 */
export class CommandLineError extends Error {
  public readonly type = 'CommandLineError'
}

export interface BeeErrorOptions {
  notFoundMessage?: string
}

function hasStatusCode(error: any, statusCode: number): boolean {
  return error?.response?.status === statusCode
}

function isNotFoundError(error: unknown): boolean {
  return hasStatusCode(error, 404)
}

function isInternalServerError(error: unknown): boolean {
  return hasStatusCode(error, 500)
}

export function errorHandler(error: any, options?: BeeErrorOptions): void {
  if (!process.exitCode) {
    process.exitCode = 1
  }
  // grab error.message, or error if it is a string
  const message: string | null = typeof error === 'string' ? error : error?.response?.data?.message || error?.message
  const type: string | null = getFieldOrNull(error, 'type')

  // write custom message for 500
  if (isInternalServerError(error)) {
    printer.printError(FORMATTED_ERROR + ' Bee responded with HTTP 500 (Internal Server Error).')

    if (!isGenericErrorPattern('Internal Server Error', message)) {
      printer.printError('')
      printer.printError('The error message is: ' + message)
    }
    // write custom message for 404
  } else if (isNotFoundError(error)) {
    printer.printError(FORMATTED_ERROR + ' Bee responded with HTTP 404 (Not Found).')

    if (options?.notFoundMessage || !isGenericErrorPattern('Not Found', message)) {
      printer.printError('')
      printer.printError('The error message is: ' + (options?.notFoundMessage || message))
    }
    // print 'command failed' message with error message if available
  } else if (message) {
    printer.printError(FORMATTED_ERROR + ' ' + message)
  } else {
    printer.printError(FORMATTED_ERROR + ' The command failed, but there is no error message available.')
  }

  // print 'check bee logs' message if error does not originate from the cli
  if (type !== 'CommandLineError') {
    if (message) {
      printer.printError('')
      printer.printError('There may be additional information in the Bee logs.')
    } else {
      printer.printError('')
      printer.printError('Check your Bee log to learn if your request reached the node.')
    }
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
