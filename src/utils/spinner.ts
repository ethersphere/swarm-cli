import chalk from 'chalk'
import ora from 'ora'
import { platform } from 'os'

const isWindows = platform() === 'win32'
const orange = chalk.rgb(208, 117, 43)

const frames = isWindows ? ['...'] : [orange('⬡ ⬡ ⬡'), orange('⬢ ⬡ ⬡'), orange('⬡ ⬢ ⬡'), orange('⬡ ⬡ ⬢')]
const interval = isWindows ? 999_999_999 : 300

export function createSpinner(text: string): ora.Ora {
  return ora({ text, interval, spinner: { frames } })
}
