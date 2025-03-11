import { Bee, PostageBatch } from '@ethersphere/bee-js'
import { Dates } from 'cafe-utility'
import { exit } from 'process'
import { CommandLog } from '../../command/root-command/command-log'
import { createKeyValue } from '../../utils/text'

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
  const stamps = await bee.getAllPostageBatch()

  const choices = stamps
    .filter(stamp => stamp.usable || stamp.duration.toSeconds() > 1)
    .map(
      stamp =>
        `${stamp.batchID} ${stamp.remainingSize.toFormattedString()} remaining, TTL ${Dates.secondsToHumanTime(
          stamp.duration.toSeconds(),
        )}`,
    )

  if (!choices.length) {
    console.error('You need to have at least one stamp for this action.')
    exit(1)
  }

  const value = await console.promptList(choices, 'Please select a stamp for this action')
  const [hex] = value.split(' ')

  return hex
}

interface PrintStampSettings {
  shortenBatchId?: boolean
  showTtl?: boolean
  printUsageInQuiet?: boolean
}

export function printStamp(stamp: PostageBatch, console: CommandLog, settings?: PrintStampSettings): void {
  const batchId = settings?.shortenBatchId ? stamp.batchID.toHex().slice(0, 8) : stamp.batchID.toHex()
  console.log(createKeyValue('Stamp ID', batchId))

  if (stamp.label) {
    console.log(createKeyValue('Label', stamp.label))
  }
  console.log(createKeyValue('Usage', stamp.usageText))
  console.log(
    createKeyValue(
      stamp.immutableFlag ? 'Capacity (immutable)' : 'Capacity (mutable)',
      `${stamp.remainingSize.toFormattedString()} remaining out of ${stamp.size.toFormattedString()}`,
    ),
  )

  if (settings?.showTtl) {
    const ttl = Dates.secondsToHumanTime(stamp.duration.toSeconds())
    const expires = stamp.duration.toEndDate().toISOString().slice(0, 10)
    console.log(createKeyValue('TTL', `${ttl} (${expires})`))
  }

  console.verbose(createKeyValue('Depth', stamp.depth))
  console.verbose(createKeyValue('Bucket Depth', stamp.bucketDepth))
  console.verbose(createKeyValue('Amount', stamp.amount))
  console.verbose(createKeyValue('Usable', stamp.usable))
  console.verbose(createKeyValue('Utilization', stamp.utilization))
  console.verbose(createKeyValue('Block Number', stamp.blockNumber))
  console.quiet(settings?.printUsageInQuiet ? `${batchId} ${stamp.usageText}` : batchId)
}
