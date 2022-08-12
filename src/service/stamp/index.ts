import { BeeDebug, DebugPostageBatch } from '@ethersphere/bee-js'
import { exit } from 'process'
import { CommandLog } from '../../command/root-command/command-log'
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

  if (!stamps.length) {
    console.error('You need to have at least one stamp for this action.')
    exit(1)
  }

  const choices = stamps.map(stamp => `${stamp.batchID} (${stamp.usageText})`)
  const value = await console.promptList(choices, 'Please select a stamp for this action')
  const [hex] = value.split(' ')

  return hex
}

export function normalizeUtilization(stamp: DebugPostageBatch): number {
  const { depth, bucketDepth, utilization } = stamp

  return utilization / Math.pow(2, depth - bucketDepth)
}

export function enrichStamp(stamp: DebugPostageBatch): EnrichedStamp {
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

export function printStamp(stamp: EnrichedStamp, console: CommandLog, printUsage: boolean): void {
  const secondsToDhms = (secs: number) => {
    var d = Math.floor(secs / (3600*24));
    var h = Math.floor(secs % (3600*24) / 3600);
    var m = Math.floor(secs % 3600 / 60);
    var s = Math.floor(secs % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
  }
  console.log(createKeyValue('Stamp ID', stamp.batchID))
  console.log(createKeyValue('Label', stamp.label))
  console.log(createKeyValue('Usage', stamp.usageText))
  console.log(createKeyValue('TTL', stamp.batchTTL === -1 ? 'unknown' : secondsToDhms(stamp.batchTTL)))
  console.verbose(createKeyValue('Depth', stamp.depth))
  console.verbose(createKeyValue('Bucket Depth', stamp.bucketDepth))
  console.verbose(createKeyValue('Amount', stamp.amount))
  console.verbose(createKeyValue('Usable', stamp.usable))
  console.verbose(createKeyValue('Utilization', stamp.utilization))
  console.verbose(createKeyValue('Block Number', stamp.blockNumber))
  console.verbose(createKeyValue('Immutable Flag', stamp.immutableFlag))
  console.quiet(printUsage ? `${stamp.batchID} ${stamp.usageText}` : stamp.batchID)
}

export function printEnrichedStamp(stamp: DebugPostageBatch, console: CommandLog): void {
  const enrichedStamp = enrichStamp(stamp)
  printStamp(enrichedStamp, console, true)
}
