import { createPropertyMetadata } from './metadata'
import { Argument as ArgumentDefinition } from '../command-parser'

const optionMetadata = createPropertyMetadata<ArgumentDefinition>()
const externalOptionMetadata = createPropertyMetadata<string>()
const argumentMetadata = createPropertyMetadata<ArgumentDefinition>()
const aggregationMetadata = createPropertyMetadata<string[]>()

export const Option = optionMetadata.decorate
export const getOption = optionMetadata.get

export const ExternalOption = externalOptionMetadata.decorate
export const getExternalOption = externalOptionMetadata.get

export const Argument = argumentMetadata.decorate
export const getArgument = argumentMetadata.get

export const Aggregation = aggregationMetadata.decorate

export function findFirstAggregation(command: object): { command: string; property: string } | null {
  // eslint-disable-next-line guard-for-in
  for (const key in command) {
    const aggregation = aggregationMetadata.get(command, key)

    if (aggregation) {
      return { command: aggregation.join(' '), property: key }
    }
  }

  return null
}
