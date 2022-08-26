import BigNumber from 'bignumber.js'
import { toSignificantDigits } from '../../src/utils'

describe('utils', () => {
  test('toSignificantDigits', () => {
    expect(toSignificantDigits(BigNumber('0'))).toBe('0.0000')
    expect(toSignificantDigits(BigNumber('100'))).toBe('100.0000')
    expect(toSignificantDigits(BigNumber('0.123456789'))).toBe('0.1234')
    expect(toSignificantDigits(BigNumber('0.0000100001'))).toBe('0.00001000')
    expect(toSignificantDigits(BigNumber('123456789.123456789'))).toBe('123456789.1234')
  })
})
