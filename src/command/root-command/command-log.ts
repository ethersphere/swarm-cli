import chalk from 'chalk'
import { prompt } from 'inquirer'
import { BeeErrorOptions, CommandLineError, errorHandler } from '../../utils/error'
import { Message } from '../../utils/message'
import { deletePreviousLine } from '../../utils/text'
import { Printer } from './printer'

interface NameValue {
  name: string
  value: string
}

export enum VerbosityLevel {
  /** No output message, only at errors or result strings (e.g. hash of uploaded file) */
  Quiet,
  /** Formatted informal messages at end of operations, output row number is equal at same operations */
  Normal,
  /** dim messages, gives info about state of the operation frequently. Default */
  Verbose,
}

export class CommandLog {
  public readonly verbosityLevel: VerbosityLevel
  // Callable logging functions (instead of console.log)

  /** Error messages */
  public error: (message: string, ...args: unknown[]) => void
  /** Messages shown in all modes */
  public all: (message: string, ...args: unknown[]) => void
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
    this.verbosityLevel = verbosityLevel
    switch (verbosityLevel) {
      case VerbosityLevel.Verbose:
        this.error = Printer.error
        this.quiet = Printer.emptyFunction
        this.verbose = Printer.log
        this.log = Printer.log
        this.all = Printer.log
        this.info = Printer.info
        this.dim = Printer.dimFunction
        this.divider = Printer.divider
        break
      case VerbosityLevel.Normal:
        this.error = Printer.error
        this.quiet = Printer.emptyFunction
        this.verbose = Printer.emptyFunction
        this.log = Printer.log
        this.all = Printer.log
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
        this.all = Printer.log
        this.info = Printer.emptyFunction
        this.dim = Printer.emptyFunction
        this.divider = Printer.emptyFunction
    }
  }

  public async confirm(message: string): Promise<boolean> {
    const { value } = await prompt({
      prefix: chalk.bold.cyan('?'),
      type: 'confirm',
      name: 'value',
      message,
    })

    return value
  }

  /**
   * Ask for an arbitrary value
   *
   * @returns value
   */
  public async askForValue(message: string): Promise<string> {
    const input = await prompt({
      prefix: chalk.bold.cyan('?'),
      name: 'value',
      message,
    })
    const { value } = input

    if (!value) {
      deletePreviousLine()
      throw new CommandLineError('No value specified')
    }

    deletePreviousLine()

    return value
  }

  /**
   * Ask for password WITHOUT confirmation
   *
   * @returns password
   */
  public async askForPassword(message: string, clear = true): Promise<string> {
    if (this.verbosityLevel === VerbosityLevel.Quiet) {
      throw new CommandLineError(Message.optionNotDefined('password'))
    }

    const { value } = await prompt({
      prefix: chalk.bold.cyan('?'),
      type: 'password',
      name: 'value',
      message,
    })

    if (!value) {
      deletePreviousLine()
      throw new CommandLineError('No password specified')
    }

    if (clear) {
      deletePreviousLine()
    }

    return value
  }

  /**
   * Ask for password with confirmation
   *
   * @returns password
   */
  public async askForPasswordWithConfirmation(passwordMessage: string, confirmationMessage: string): Promise<string> {
    const password = await this.askForPassword(passwordMessage, false)
    const passwordAgain = await this.askForPassword(confirmationMessage, false)

    if (password !== passwordAgain) {
      throw new CommandLineError('The two passwords do not match')
    }

    return password
  }

  public async promptList(choices: string[] | NameValue[], message: string): Promise<string> {
    const result = await prompt({
      prefix: chalk.bold.cyan('?'),
      name: 'value',
      type: 'list',
      message,
      choices,
      loop: false,
    })

    deletePreviousLine()

    return result.value
  }

  public async confirmAndDelete(message: string): Promise<boolean> {
    const value = await this.confirm(message)
    deletePreviousLine()

    return value
  }

  public printBeeError(error: unknown, options?: BeeErrorOptions): void {
    errorHandler(error, options)
  }
}
