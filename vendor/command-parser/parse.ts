import { Argument } from './type'

type ParseResult = Error | { value: boolean | number | bigint | string; skip: number }

function prepareNumericalString(string: string): string | null {
  const replaced = string.replace(/_/g, '')

  return replaced === '' ? null : replaced
}

function parseNumericalUnit(rawValue: string): { b: bigint; n: number } | null {
  if (/[kK]$/.test(rawValue)) {
    return { b: BigInt(1e3), n: 1e3 }
  }

  if (/[mM]$/.test(rawValue)) {
    return { b: BigInt(1e6), n: 1e6 }
  }

  if (/[bB]$/.test(rawValue)) {
    return { b: BigInt(1e9), n: 1e9 }
  }

  if (/[tT]$/.test(rawValue)) {
    return { b: BigInt(1e12), n: 1e12 }
  }

  return null
}

function checkRange(option: Argument, value: number | bigint): Error | null {
  if (option.minimum !== undefined && value < option.minimum) {
    return Error('[' + option.key + '] must be at least ' + option.minimum)
  }

  if (option.maximum !== undefined && value > option.maximum) {
    return Error('[' + option.key + '] must be at most ' + option.maximum)
  }

  return null
}

function parseNumber(option: Argument, rawValue: string): ParseResult {
  const multiplier = parseNumericalUnit(rawValue)
  const parsableString = multiplier ? rawValue.slice(0, rawValue.length - 1) : rawValue

  if (!/^-?[0-9_]+$/.test(parsableString)) {
    return Error('Expected number for ' + option.key + ', got ' + rawValue)
  }
  const parsedValue = parseInt(prepareNumericalString(parsableString) ?? '', 10)
  const value = multiplier ? parsedValue * multiplier.n : parsedValue

  if (isNaN(value)) {
    return Error('Expected number for ' + option.key + ', got ' + rawValue)
  }

  return checkRange(option, value) ?? { value, skip: 1 }
}

function parseBigInt(option: Argument, rawValue: string): ParseResult {
  try {
    const multiplier = parseNumericalUnit(rawValue)
    const parsableString = multiplier ? rawValue.slice(0, rawValue.length - 1) : rawValue
    const prepared = prepareNumericalString(parsableString)

    if (prepared === null) {
      throw Error()
    }
    const parsedValue = BigInt(prepared)
    const value = multiplier ? parsedValue * multiplier.b : parsedValue

    return checkRange(option, value) ?? { value, skip: 1 }
  } catch {
    return Error('Expected BigInt for ' + option.key + ', got ' + rawValue)
  }
}

function validateStringLength(option: Argument, string: string): Error | undefined {
  if (option.minimumLength === undefined && string.length === 0) {
    return Error('[' + option.key + '] must not be empty')
  }

  if (option.length && string.length !== option.length) {
    return Error('[' + option.key + '] must have length of ' + option.length + ' characters')
  }

  if (option.minimumLength && string.length < option.minimumLength) {
    return Error('[' + option.key + '] must have length of at least ' + option.minimumLength + ' characters')
  }

  if (option.maximumLength && string.length > option.maximumLength) {
    return Error('[' + option.key + '] must have length of at most ' + option.maximumLength + ' characters')
  }

  return undefined
}

function parseDecimalString(option: Argument, rawValue: string): ParseResult {
  const prepared = prepareNumericalString(rawValue)

  if (prepared === null || !/^[0-9]+(\.[0-9]+)?$/.test(prepared)) {
    return Error('Expected decimal string for ' + option.key + ', got ' + rawValue)
  }

  return { value: prepared, skip: 1 }
}

function parseHexString(option: Argument, rawValue: string): ParseResult {
  const lowercase = rawValue.toLowerCase()
  const hexString = lowercase.startsWith('0x') ? lowercase.slice(2) : lowercase

  if (!/^[a-f0-9]+$/.test(hexString) && hexString.length > 0) {
    return Error('Expected hex string for ' + option.key + ', got ' + rawValue)
  }
  const lengthError = validateStringLength(option, hexString)

  if (lengthError) {
    return lengthError
  }

  if (!option.oddLength && hexString.length % 2 === 1) {
    return Error('[' + option.key + '] must have even length')
  }

  return { value: hexString, skip: 1 }
}

function parseEnum(option: Argument, rawValue: string): ParseResult {
  const allowed = option.enum || []

  if (!allowed.includes(rawValue)) {
    return Error('[' + option.key + '] must be one of: ' + allowed.join(', '))
  }

  return { value: rawValue, skip: 1 }
}

export function parseValue(option: Argument, rawValue: string | undefined): ParseResult {
  const { type } = option

  if (type === 'boolean') {
    if (rawValue === 'true') {
      return { value: true, skip: 1 }
    }

    if (rawValue === 'false') {
      return { value: false, skip: 1 }
    }

    return { value: true, skip: 0 }
  }

  if (rawValue === undefined) {
    return Error('Expected value for ' + option.key)
  }

  switch (type) {
    case 'number':
      return parseNumber(option, rawValue)
    case 'bigint':
      return parseBigInt(option, rawValue)
    case 'hex-string':
      return parseHexString(option, rawValue)
    case 'decimal-string':
      return parseDecimalString(option, rawValue)
    case 'enum':
      return parseEnum(option, rawValue)
    default:
      return validateStringLength(option, rawValue) || { value: rawValue, skip: 1 }
  }
}
