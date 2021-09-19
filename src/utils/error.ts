import { printer } from '../printer'

interface BeeErrorOptions {
  notFoundMessage?: string
}

function hasStatusCode(error: unknown, statusCode: number): boolean {
  return typeof error === 'object' && error !== null && Reflect.get(error, 'status') === statusCode
}

function isNotFoundError(error: unknown): boolean {
  return hasStatusCode(error, 404)
}

function isInternalServerError(error: unknown): boolean {
  return hasStatusCode(error, 500)
}

export function handleError(error: unknown, options?: BeeErrorOptions): void {
  if (typeof error === 'string') {
    printer.printError(error)
  } else if (isInternalServerError(error)) {
    printer.printError('Internal Server Error')
    printer.printError('Check your Bee log to see what went wrong.')
  } else if (isNotFoundError(error) && options?.notFoundMessage) {
    printer.printError(options.notFoundMessage)
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    printer.printError(Reflect.get(error, 'message'))
  } else {
    printer.printError('Failed to run command!')
    printer.printError('')
    printer.printError('Check your Bee log to see what went wrong.')
  }
}
