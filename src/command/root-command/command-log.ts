/* eslint-disable no-console */
import { bold, dim, italic } from 'kleur'
import { prompt } from 'inquirer'
import { exit } from 'process'

export enum VerbosityLevel {
  /** No output message, only at errors or result strings (e.g. hash of uploaded file) */
  Quiet,
  /** Formatted informal messages at end of operations, output row number is equal at same operations */
  Normal,
  /** dim messages, gives info about state of the operation frequently. Default */
  Verbose,
}

export class CommandLog {
  // Callable logging functions (instead of console.log)

  /** Error messages */
  public error: (message: string, ...args: unknown[]) => void
  /** Identical with console.log */
  public log: (message: string, ...args: unknown[]) => void
  /** Informal messages (e.g. Tips) */
  public info: (message: string, ...args: unknown[]) => void
  /** Additional info, state of the process */
  public dim: (message: string, ...args: unknown[]) => void
  /** Draw divider line to separate content in output */
  public divider: (char?: string) => void

  constructor(verbosityLevel: VerbosityLevel) {
    const emptyFunction = () => {
      return
    }
    const divider = (char = '-') => {
      console.log(char.repeat(process.stdout.columns))
    }
    const error = (message: string, ...args: unknown[]) => console.log(bold().white().bgRed(message), ...args)
    const log = (message: string, ...args: unknown[]) => console.log(message, ...args)
    const info = (message: string, ...args: unknown[]) => console.log(italic().dim(message), ...args)
    const dimFunction = (message: string, ...args: unknown[]) => console.log(dim(message), ...args)

    switch (verbosityLevel) {
      case VerbosityLevel.Verbose:
        this.error = error
        this.log = log
        this.info = info
        this.dim = dimFunction
        this.divider = divider
        break
      case VerbosityLevel.Normal:
        this.error = error
        this.log = log
        this.info = info
        this.divider = divider
        this.dim = emptyFunction
        break
      default:
        // quiet
        this.error = error
        this.log = emptyFunction
        this.info = emptyFunction
        this.dim = emptyFunction
        this.divider = emptyFunction
    }
  }

  /**
   * Ask for password
   *
   * @returns password
   */
  public async askForPassword(): Promise<string> {
    const passwordInput = await prompt({
      type: 'password',
      name: 'question',
      message: `Please provide a password`,
    })
    const password = passwordInput.question

    if (!password) {
      this.error('You did not pass any password')

      exit(1)
    }
    const passwordInputAgain = await prompt({
      type: 'password',
      name: 'question',
      message: `Please repeat the previously typed password`,
    })

    if (passwordInputAgain.question !== password) {
      this.error('The two passwords do not match')

      exit(1)
    }

    return password
  }
}
