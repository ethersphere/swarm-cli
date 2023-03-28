import { BeeDebug, PostageBatch } from '@ethersphere/bee-js'
import { exit } from 'process'
import { CommandLog } from '../../command/root-command/command-log'
import { getFieldOrNull, secondsToDhms } from '../../utils'
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
    .map(stamp => `${stamp.batchID} (${stamp.usageText}) expires in ${secondsToDhms(stamp.batchTTL, true)}`)

  if (!choices.length) {
    console.error('You need to have at least one stamp for this action.')
    exit(1)
  }

  const value = await console.promptList(choices, 'Please select a stamp for this action')
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

  if (settings?.showTtl) {
    console.log(
      createKeyValue('TTL', stamp.batchTTL === -1 ? 'unknown' : secondsToDhms(stamp.batchTTL, settings?.shortenTtl)),
    )
  }

  if (stamp.batchTTL !== -1) {
    try {
      console.log(createKeyValue('Expires', new Date(Date.now() + stamp.batchTTL * 1000).toISOString().slice(0, 10)))
    } catch {
      // ignore
    }
  }
  console.verbose(createKeyValue('Depth', stamp.depth))
  console.verbose(createKeyValue('Bucket Depth', stamp.bucketDepth))
  console.verbose(createKeyValue('Amount', stamp.amount))
  console.verbose(createKeyValue('Usable', stamp.usable))
  console.verbose(createKeyValue('Utilization', stamp.utilization))
  console.verbose(createKeyValue('Block Number', stamp.blockNumber))
  console.verbose(createKeyValue('Immutable Flag', stamp.immutableFlag))
  console.quiet(settings?.printUsageInQuiet ? `${batchId} ${richStamp.usageText}` : batchId)
}

function ensureEnrichedStamp(stamp: PostageBatch | EnrichedStamp): EnrichedStamp {
  if (!getFieldOrNull(stamp, 'usageText')) {
    return enrichStamp(stamp)
  }

  return stamp as EnrichedStamp
}
