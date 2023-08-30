import { BeeDebug, PostageBatch, Utils } from '@ethersphere/bee-js'
import { exit } from 'process'
import { CommandLog } from '../../command/root-command/command-log'
import { getFieldOrNull, secondsToDhms } from '../../utils'
import { Storage } from '../../utils/storage'
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
export async function pickStamp(beeDebug: BeeDebug, console: CommandLog): Promise<string> {
  const stamps = ((await beeDebug.getAllPostageBatch()) || []).map(enrichStamp)

  const choices = stamps
    .filter(stamp => stamp.usable || stamp.batchTTL > 0)
    .map(stamp => `${stamp.batchID} ${stamp.remainingCapacity} expires in ${secondsToDhms(stamp.batchTTL, true)}`)

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
  const capacity = new Storage(Utils.getStampMaximumCapacityBytes(stamp.depth))
  const remainingCapacity = new Storage(capacity.getBytes() * (1 - usage))

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
  shortenTtl?: boolean
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
  console.log(createKeyValue('Remaining Capacity', richStamp.remainingCapacity.toString()))
  console.verbose(
    createKeyValue(
      richStamp.immutableFlag ? 'Total Capacity (immutable)' : 'Total Capacity (mutable)',
      richStamp.capacity.toString(),
    ),
  )

  if (settings?.showTtl) {
    const ttl = stamp.batchTTL === -1 ? 'unknown' : secondsToDhms(stamp.batchTTL, settings?.shortenTtl)
    const expires =
      stamp.batchTTL === -1 ? 'unknown' : new Date(Date.now() + stamp.batchTTL * 1000).toISOString().slice(0, 10)
    console.log(createKeyValue('TTL', ttl))
    console.log(createKeyValue('Expires', expires))
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
