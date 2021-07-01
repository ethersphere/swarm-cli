import ora from 'ora'

const frames = ['⬡ ⬡ ⬡', '⬢ ⬡ ⬡', '⬡ ⬢ ⬡', '⬡ ⬡ ⬢']

export function createSpinner(text: string): ora.Ora {
  return ora({ text, interval: 300, spinner: { frames } })
}
