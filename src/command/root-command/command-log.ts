import { prompt } from 'inquirer'
import { exit } from 'process'
import { isInternalServerError, isNotFoundError } from '../../utils/error'
import { BeeError } from '../../utils/types'
import { Printer } from './printer'

export enum VerbosityLevel {
  /** No output message, only at errors or result strings (e.g. hash of uploaded file) */
  Quiet,
  /** Formatted informal messages at end of operations, output row number is equal at same operations */
  Normal,
  /** dim messages, gives info about state of the operation frequently. Default */
  Verbose,
}

interface BeeErrorOptions {
  notFoundMessage?: string
}

export class CommandLog {
  // Callable logging functions (instead of console.log)

  /** Error messages */
  public error: (message: string, ...args: unknown[]) => void
  /** Identical with console.log */
  public log: (message: string, ...args: unknown[]) => void
  /** Informal messages (e.g. Tips) */
  public info: (message: string, ...args: unknown[]) => void
  /** Messages shown in quiet */
  public quiet: (message: string, ...args: unknown[]) => void
  /** Messages shown in verbose */
  public verbose: (message: string, ...args: unknown[]) => void
  /** Additional info, state of the process */
  public dim: (message: string, ...args: unknown[]) => void
  /** Draw divider line to separate content in output */
  public divider: (char?: string) => void

  constructor(verbosityLevel: VerbosityLevel) {
    switch (verbosityLevel) {
      case VerbosityLevel.Verbose:
        this.error = Printer.error
        this.quiet = Printer.emptyFunction
        this.verbose = Printer.log
        this.log = Printer.log
        this.info = Printer.info
        this.dim = Printer.dimFunction
        this.divider = Printer.divider
        break
      case VerbosityLevel.Normal:
        this.error = Printer.error
        this.quiet = Printer.emptyFunction
        this.verbose = Printer.emptyFunction
        this.log = Printer.log
        this.info = Printer.info
        this.dim = Printer.emptyFunction
        this.divider = Printer.divider
        break
      default:
        // quiet
        this.error = Printer.error
        this.quiet = Printer.log
        this.verbose = Printer.emptyFunction
        this.log = Printer.emptyFunction
        this.info = Printer.emptyFunction
        this.dim = Printer.emptyFunction
        this.divider = Printer.emptyFunction
    }
  }

  /**
   * Ask for an arbitrary value
   *
   * @returns value
   */
  public async askForValue(message: string): Promise<string> {
    const input = await prompt({
      name: 'value',
      message,
    })
    const { value } = input

    if (!value) {
      this.error('You did not specify any value')

      exit(1)
    }

    return value
  }

  /**
   * Ask for password WITHOUT confirmation
   *
   * @returns password
   */
  public async askForPassword(message: string): Promise<string> {
    const { value } = await prompt({
      type: 'password',
      name: 'value',
      message,
    })

    if (!value) {
      this.error('You did not specify any password')

      exit(1)
    }

    return value
  }

  /**
   * Ask for password with confirmation
   *
   * @returns password
   */
  public async askForPasswordWithConfirmation(): Promise<string> {
    const password = await this.askForPassword('Please provide a password')
    const passwordAgain = await this.askForPassword('Please repeat the password')

    if (password !== passwordAgain) {
      this.error('The two passwords do not match')

      exit(1)
    }

    return password
  }

  public async promptList(choices: string[], message: string): Promise<string> {
    const result = await prompt({ name: 'value', type: 'list', message, choices, loop: false })

    return result.value
  }

  public printBeeError(error: BeeError, options?: BeeErrorOptions): void {
    if (isInternalServerError(error)) {
      this.error('Internal Server Error')
      this.error('Check your Bee log to see what went wrong.')
    } else if (isNotFoundError(error) && options?.notFoundMessage) {
      this.error(options.notFoundMessage)
    } else {
      this.error(error.message)
    }
  }
}
