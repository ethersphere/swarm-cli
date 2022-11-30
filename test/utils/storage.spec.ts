import { Storage } from '../../src/utils/storage'

describe('Storage', () => {
  test('should return bytes', () => {
    const storage = new Storage(1024)
    expect(storage.getBytes()).toBe(1024)
  })

  test('should return kilobytes', () => {
    const storage = new Storage(1024)
    expect(storage.getKilobytes()).toBe(1)
  })

  test('should return megabytes', () => {
    const storage = new Storage(1024 * 1024)
    expect(storage.getMegabytes()).toBe(1)
  })

  test('should return gigabytes', () => {
    const storage = new Storage(1024 * 1024 * 1024)
    expect(storage.getGigabytes()).toBe(1)
  })

  test('should return terabytes', () => {
    const storage = new Storage(1024 * 1024 * 1024 * 1024)
    expect(storage.getTerabytes()).toBe(1)
  })

  test('toString should return bytes', () => {
    const storage = new Storage(500)
    expect(storage.toString()).toBe('500 B')
  })

  test('toString should return kilobytes', () => {
    const storage = new Storage(500 * 1024)
    expect(storage.toString()).toBe('500.00 KB')
  })

  test('toString should return megabytes', () => {
    const storage = new Storage(500 * 1024 * 1024)
    expect(storage.toString()).toBe('500.00 MB')
  })

  test('toString should return gigabytes', () => {
    const storage = new Storage(500 * 1024 * 1024 * 1024)
    expect(storage.toString()).toBe('500.00 GB')
  })

  test('toString should return terabytes', () => {
    const storage = new Storage(500 * 1024 * 1024 * 1024 * 1024)
    expect(storage.toString()).toBe('500.00 TB')
  })
})
