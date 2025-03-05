/* eslint-disable @typescript-eslint/no-namespace */
import { Strings } from 'cafe-utility'

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchLinesInOrder(expected: string[][]): CustomMatcherResult
      toMatchLinesInAnyOrder(expected: string[][]): CustomMatcherResult
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
    if (received.some(r => r.includes(p[0]))) {
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
