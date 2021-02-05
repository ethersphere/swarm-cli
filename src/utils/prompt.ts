// General prompts

import { prompt } from 'inquirer'
import { red } from 'kleur'
import { exit } from 'process'

/**
 * Ask for password
 *
 * @returns password
 */
export async function askForPassword(): Promise<string> {
  const passwordInput = await prompt({
    type: 'password',
    name: 'question',
    message: `Please provide a password`,
  })
  const password = passwordInput.question

  if (!password) {
    console.warn(red('You did not pass any password'))

    exit(1)
  }
  const passwordInputAgain = await prompt({
    type: 'password',
    name: 'question',
    message: `Please repeat the previously typed password`,
  })

  if (passwordInputAgain.question !== password) {
    console.warn(red('The two passwords do not match'))

    exit(1)
  }

  return password
}
