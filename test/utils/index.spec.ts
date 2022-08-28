import BigNumber from 'bignumber.js'
import { secondsToDhms, toSignificantDigits } from '../../src/utils'

describe('utils', () => {
  test('toSignificantDigits', () => {
    expect(toSignificantDigits(BigNumber('0'))).toBe('0.0000')
    expect(toSignificantDigits(BigNumber('100'))).toBe('100.0000')
    expect(toSignificantDigits(BigNumber('0.123456789'))).toBe('0.1234')
    expect(toSignificantDigits(BigNumber('0.0000100001'))).toBe('0.00001000')
    expect(toSignificantDigits(BigNumber('123456789.123456789'))).toBe('123456789.1234')
  })

  test('secondsToDhms', () => {
    expect(secondsToDhms(10)).toBe('10 seconds')
    expect(secondsToDhms(61)).toBe('1 minute 1 second')
    expect(secondsToDhms(3602)).toBe('1 hour 2 seconds')
    expect(secondsToDhms(100000)).toBe('1 day 3 hours 46 minutes 40 seconds')
    expect(secondsToDhms(10, true)).toBe('10 seconds')
    expect(secondsToDhms(61, true)).toBe('1 minute')
    expect(secondsToDhms(3602, true)).toBe('1 hour')
    expect(secondsToDhms(100000, true)).toBe('1 day')
  })
})
