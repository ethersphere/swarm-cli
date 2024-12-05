import { Bee, PostageBatch, Utils } from '@ethersphere/bee-js'
import { Dates, Numbers } from 'cafe-utility'
import { exit } from 'process'
import { CommandLog } from '../../command/root-command/command-log'
import { getFieldOrNull } from '../../utils'
import { createKeyValue } from '../../utils/text'
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

  const choices = stamps
    .filter(stamp => stamp.usable || stamp.batchTTL > 0)
    .map(
      stamp =>
        `${stamp.batchID} ${Numbers.convertBytes(stamp.remainingCapacity)} remaining, TTL ${Dates.secondsToHumanTime(
          stamp.batchTTL,
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

export function enrichStamp(stamp: PostageBatch): EnrichedStamp {
  const usage = Utils.getStampUsage(stamp.utilization, stamp.depth, stamp.bucketDepth)
  const usageNormal = Math.ceil(usage * 100)
  const usageText = usageNormal + '%'
  const capacity = Utils.getStampMaximumCapacityBytes(stamp.depth)
  const remainingCapacity = capacity * (1 - usage)

  return {
    ...stamp,
    usage,
    usageNormal,
    usageText,
    capacity,
    remainingCapacity,
  }
}

interface PrintStampSettings {
  shortenBatchId?: boolean
  showTtl?: boolean
  printUsageInQuiet?: boolean
}

export function printStamp(
  stamp: PostageBatch | EnrichedStamp,
  console: CommandLog,
  settings?: PrintStampSettings,
): void {
  const richStamp = ensureEnrichedStamp(stamp)
  const batchId = settings?.shortenBatchId ? stamp.batchID.slice(0, 8) : stamp.batchID
  console.log(createKeyValue('Stamp ID', batchId))

  if (stamp.label) {
    console.log(createKeyValue('Label', stamp.label))
  }
  console.log(createKeyValue('Usage', richStamp.usageText))
  console.log(
    createKeyValue(
      richStamp.immutableFlag ? 'Capacity (immutable)' : 'Capacity (mutable)',
      `${Numbers.convertBytes(richStamp.remainingCapacity)} remaining out of ${Numbers.convertBytes(
        richStamp.capacity,
      )}`,
    ),
  )

  if (settings?.showTtl) {
    const ttl = stamp.batchTTL === -1 ? 'unknown' : Dates.secondsToHumanTime(stamp.batchTTL)
    const expires =
      stamp.batchTTL === -1 || stamp.batchTTL > 1e11
        ? 'unknown'
        : new Date(Date.now() + stamp.batchTTL * 1000).toISOString().slice(0, 10)
    console.log(createKeyValue('TTL', `${ttl} (${expires})`))
  }

  console.verbose(createKeyValue('Depth', stamp.depth))
  console.verbose(createKeyValue('Bucket Depth', stamp.bucketDepth))
  console.verbose(createKeyValue('Amount', stamp.amount))
  console.verbose(createKeyValue('Usable', stamp.usable))
  console.verbose(createKeyValue('Utilization', stamp.utilization))
  console.verbose(createKeyValue('Block Number', stamp.blockNumber))
  console.quiet(settings?.printUsageInQuiet ? `${batchId} ${richStamp.usageText}` : batchId)
}

function ensureEnrichedStamp(stamp: PostageBatch | EnrichedStamp): EnrichedStamp {
  if (!getFieldOrNull(stamp, 'usageText')) {
    return enrichStamp(stamp)
  }

  return stamp as EnrichedStamp
}
