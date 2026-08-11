import { RedundancyLevel } from '@ethersphere/bee-js'
import { CommandLineError } from './error'

export const DEFAULT_REDUNDANCY_LEVEL = RedundancyLevel.MEDIUM

export type RedundancyResult = {
  value?: RedundancyLevel | undefined
  error?: CommandLineError
}

export function determineRedundancyLevel(redundancy: string): RedundancyResult {
  if (!redundancy) {
    return { value: undefined }
  }
  switch (redundancy.toUpperCase()) {
    case 'OFF':
      return { value: RedundancyLevel.OFF }
    case 'MEDIUM':
      return { value: RedundancyLevel.MEDIUM }
    case 'STRONG':
      return { value: RedundancyLevel.STRONG }
    case 'INSANE':
      return { value: RedundancyLevel.INSANE }
    case 'PARANOID':
      return { value: RedundancyLevel.PARANOID }
    default:
      return { error: new CommandLineError(`Invalid redundancy level: ${redundancy}`) }
  }
}
