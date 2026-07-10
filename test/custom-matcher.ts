/* eslint-disable @typescript-eslint/no-namespace */
import { Strings } from 'cafe-utility'

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchLinesInOrder(expected: string[][]): CustomMatcherResult
      toMatchLinesInAnyOrder(expected: string[][]): CustomMatcherResult
      toBeQRCode(): CustomMatcherResult
    }
  }
}

export function toMatchLinesInOrder(received: string[], pattern: string[][]) {
  const pass = Strings.linesMatchInOrder(received, pattern)
  const message = () => `${JSON.stringify(received, null, 4)} does not match ${JSON.stringify(pattern, null, 4)}`

  return {
    pass,
    message,
  }
}

export function toMatchLinesInAnyOrder(received: string[], pattern: string[][]) {
  for (const p of pattern) {
    if (received.some(r => p.every(substring => r.includes(substring)))) {
      continue
    }

    return {
      pass: false,
      message: () => `${JSON.stringify(received, null, 4)} does not match ${JSON.stringify(pattern, null, 4)}`,
    }
  }

  return {
    pass: true,
    message: () => '',
  }
}

export function toBeQRCode(received: string) {
  const pass = /[▀▄█]/.test(received)

  return {
    pass,
    message: () => `expected ${JSON.stringify(received)} ${pass ? 'not ' : ''}to be a QR code`,
  }
}
