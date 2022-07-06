import chalk from 'chalk'
import ora, { Ora } from 'ora'
import { platform } from 'os'
import { VerbosityLevel } from '../command/root-command/command-log'

const isWindows = platform() === 'win32'
const orange = chalk.rgb(208, 117, 43)

const frames = isWindows ? ['...'] : [orange('⬡ ⬡ ⬡'), orange('⬢ ⬡ ⬡'), orange('⬡ ⬢ ⬡'), orange('⬡ ⬡ ⬢')]
const interval = isWindows ? 999_999_999 : 300

export function createSpinner(text: string): Ora {
  return ora({ text, interval, spinner: { frames } })
}

export function createAndRunSpinner(text: string, verbosity: VerbosityLevel): Ora {
  const spinner = createSpinner(text)

  if (verbosity !== VerbosityLevel.Quiet) {
    spinner.start()
  }

  return spinner
}
