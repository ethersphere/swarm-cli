import { Bee, PostageBatch } from '@ethersphere/bee-js'
import { bold } from 'kleur'
import { exit } from 'process'
import { CommandLog } from '../../command/root-command/command-log'
import { EnrichedStamp } from './types/stamp'

/**
 * Displays an interactive stamp picker to select a Stamp ID.
 *
 * A typical use case is to prompt the user for a stamp, when
 * the command requires one, but was not specified in `argv`.
 *
 * Makes a request via `bee` to fetch possible stamps.
 *
 * @returns {Promise<string>} Hex representation of the Stamp ID.
 */
export async function pickStamp(bee: Bee, console: CommandLog): Promise<string> {
  const stamps = ((await bee.getAllPostageBatch()) || []).map(enrichStamp)

  if (!stamps.length) {
    console.error('You need to have at least one stamp for this action.')
    exit(1)
  }

  const choices = stamps.map(stamp => `${stamp.batchID} (${stamp.usageText})`)
  const value = await console.promptList(
    choices,
    'Please select a stamp for this action.\n\n  Stamp ID' + ' '.repeat(56) + ' Usage\n',
  )
  const [hex] = value.split(' ')

  return hex
}

export function normalizeUtilization(stamp: PostageBatch): number {
  const { depth, bucketDepth, utilization } = stamp

  return utilization / Math.pow(2, depth - bucketDepth)
}

export function enrichStamp(stamp: PostageBatch): EnrichedStamp {
  const usage = normalizeUtilization(stamp)
  const usageNormal = Math.ceil(usage * 100)
  const usageText = usageNormal + '%'

  return {
    ...stamp,
    usage,
    usageNormal,
    usageText,
  }
}

export function printStamp(stamp: EnrichedStamp, console: CommandLog): void {
  console.divider('-')
  console.log(bold('Stamp ID: ') + stamp.batchID)
  console.log(bold('Usage: ') + stamp.usageText)
  console.verbose(bold('Depth: ') + stamp.depth)
  console.verbose(bold('Bucket depth: ') + stamp.bucketDepth)
  console.verbose(bold('Amount: ') + stamp.amount)
  console.verbose(bold('Usable: ') + stamp.usable)
  console.verbose(bold('Utilization: ') + stamp.utilization)
  console.verbose(bold('Block Number: ') + stamp.blockNumber)
  console.verbose(bold('Immutable Flag: ') + stamp.immutableFlag)
  console.quiet(stamp.batchID + ' ' + stamp.usageText)
}

export function printEnrichedStamp(stamp: PostageBatch, console: CommandLog): void {
  const enrichedStamp = enrichStamp(stamp)
  printStamp(enrichedStamp, console)
}
