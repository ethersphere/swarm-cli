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
  const message = getFieldOrNull(error, 'message')

  if (isInternalServerError(error)) {
    printer.printError('Bee responded with HTTP 500 (Internal Server Error).')

    if (!isGenericErrorPattern('Internal Server Error', message)) {
      printer.printError('')
      printer.printError('The error message is: ' + message)
    }
  } else if (isNotFoundError(error)) {
    printer.printError('Bee responded with HTTP 404 (Not Found).')

    if (options?.notFoundMessage || !isGenericErrorPattern('Not Found', message)) {
      printer.printError('')
      printer.printError('The error message is: ' + (options?.notFoundMessage || message))
    }
  } else if (message) {
    printer.printError('The command failed with error message: ' + message)
  } else if (typeof error === 'string' && error) {
    printer.printError('The command failed with error message: ' + error)
  } else {
    printer.printError('The command failed, but there is no error message available.')
  }

  if ((typeof error === 'string' && error) || message) {
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

  return message === errorName || message === `${errorName}: ${errorName}`
}
