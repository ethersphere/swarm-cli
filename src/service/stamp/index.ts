import { Bee } from '@ethersphere/bee-js'
import { exit } from 'process'
import { CommandLog } from '../../command/root-command/command-log'

export async function pickStamp(bee: Bee, console: CommandLog): Promise<string> {
  const stamps = await bee.getAllPostageBatch()

  if (!stamps.length) {
    console.error('You need to have at least one stamp for this action.')
    exit(1)
  }

  const choices = stamps.map(stamp => `${stamp.batchID} (${stamp.utilization})`)
  const value = await console.promptList(choices, 'Please select a stamp for this action.')
  const [hex] = value.split(' ')

  return hex
}
