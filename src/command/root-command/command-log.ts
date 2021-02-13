import { dim, italic, red } from 'kleur'

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
  public error!: (message: string, ...args: unknown[]) => void
  /** Identical with console.log */
  public log!: (message: string, ...args: unknown[]) => void
  /** Informal messages (e.g. Tips) */
  public info!: (message: string, ...args: unknown[]) => void
  /** Additional info, state of the process */
  public dim!: (message: string, ...args: unknown[]) => void

  constructor(verbosityLevel: VerbosityLevel) {
    this.setVerbosity(verbosityLevel)
  }

  public setVerbosity(verbosityLevel: VerbosityLevel): void {
    const emptyFunction = () => {
      return
    }

    switch (verbosityLevel) {
      case VerbosityLevel.Verbose:
        this.error = (message: string, ...args: unknown[]) => console.log(red(message), ...args)
        this.log = (message: string, ...args: unknown[]) => console.log(message, ...args)
        this.info = (message: string, ...args: unknown[]) => console.log(italic(message), ...args)
        this.dim = (message: string, ...args: unknown[]) => console.log(dim(message), ...args)
        break
      case VerbosityLevel.Normal:
        this.error = (message: string, ...args: unknown[]) => console.log(red(message), ...args)
        this.log = (message: string, ...args: unknown[]) => console.log(message, ...args)
        this.info = (message: string, ...args: unknown[]) => console.log(italic(message), ...args)
        this.dim = emptyFunction
        break
      default:
        // quite
        this.error = (message: string, ...args: unknown[]) => console.log(red(message), ...args)
        this.log = emptyFunction
        this.info = emptyFunction
        this.dim = emptyFunction
    }
  }
}
