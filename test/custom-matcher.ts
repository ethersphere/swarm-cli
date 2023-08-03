/* eslint-disable @typescript-eslint/no-namespace */
import { Strings } from 'cafe-utility'

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchLinesInOrder(expected: string[][]): CustomMatcherResult
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
