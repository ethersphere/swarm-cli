import { BrandedString } from './types'

/**
 * Nominal type to represent hex strings
 */
export type HexString = BrandedString<'HexString'>

/**
 * Strips the '0x' hex prefix from a string

 * @param hex string input
 */
export function stripHexPrefix<T extends string>(hex: T): T {
  return hex.startsWith('0x') ? (hex.slice(2) as T) : hex
}

/**
 * Converts a hex string to Uint8Array
 *
 * @param hex string input
 */
export function hexToBytes(hex: string): Uint8Array {
  const hexWithoutPrefix = stripHexPrefix(hex)
  const bytes = new Uint8Array(hexWithoutPrefix.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    const hexByte = hexWithoutPrefix.substr(i * 2, 2)
    bytes[i] = parseInt(hexByte, 16)
  }

  return bytes
}

/**
 * Converts array of number or Uint8Array to hex string.
 *
 * Optionally provides a the '0x' prefix.
 *
 * @param bytes       The input array
 * @param withPrefix  Provides '0x' prefix when true (default: false)
 */
export function bytesToHex(bytes: Uint8Array, withPrefix = false): HexString {
  const prefix = withPrefix ? '0x' : ''
  const hexByte = (n: number) => n.toString(16).padStart(2, '0')
  const hex = Array.from(bytes, hexByte).join('')

  return `${prefix}${hex}` as HexString
}
