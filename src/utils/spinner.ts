import ora from 'ora'
import { platform } from 'os'
import { orange } from './text'

const isWindows = platform() === 'win32'

const frames = isWindows ? ['...'] : [orange('⬡ ⬡ ⬡'), orange('⬢ ⬡ ⬡'), orange('⬡ ⬢ ⬡'), orange('⬡ ⬡ ⬢')]
const interval = isWindows ? 999_999_999 : 300

export function createSpinner(text: string): ora.Ora {
  return ora({ text, interval, spinner: { frames } })
}
