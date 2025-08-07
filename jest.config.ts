/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
import { Bee } from '@ethersphere/bee-js'
import type { Config } from '@jest/types'
import { Dates, System } from 'cafe-utility'
import { getPssAddress } from './test/utility/address'
import { getOrBuyStamp } from './test/utility/stamp'

export default async (): Promise<Config.InitialOptions> => {
  /**
   * SKIP_WORKER can be enabled when running a subset of the tests manually,
   * which do not require any worker nodes, and therefore the stack
   * only consists a single queen node as well
   */
  if (!process.env.SKIP_WORKER) {
    process.env.WORKER_PSS_ADDRESS = (await getPssAddress('http://localhost:11633')).toCompressedHex()
  }

  if (!process.env.TEST_STAMP) {
    process.env.TEST_STAMP = (await getOrBuyStamp()).toHex()
  }

  for (let i = 0; i < 5; i++) {
    const port = 1633 + i * 10000
    const bee = new Bee(`http://localhost:${port}`)

    const startedAt = Date.now()
    console.log('Waiting for Bee node to warm up on port', port)
    const { version } = await bee.getHealth()
    if (version.includes('2.5') || version.startsWith('2.4')) {
      await System.waitFor(async () => (await bee.getTopology()).depth < 31, {
        attempts: 300,
        waitMillis: Dates.seconds(1),
        requiredConsecutivePasses: 3,
      })
    } else {
      await System.waitFor(async () => (await bee.getStatus()).isWarmingUp === false, {
        attempts: 300,
        waitMillis: Dates.seconds(1),
        requiredConsecutivePasses: 3,
      })
    }
    const elapsed = Date.now() - startedAt
    console.log(`Bee node on port ${port} warmed up in ${elapsed} milliseconds`)
  }

  return {
    // Indicates whether the coverage information should be collected while executing the test
    // collectCoverage: false,

    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',

    // An array of regexp pattern strings used to skip coverage collection
    coveragePathIgnorePatterns: ['/node_modules/'],

    // An array of directory names to be searched recursively up from the requiring module's location
    moduleDirectories: ['node_modules'],

    // Run tests from one or more projects
    projects: [
      {
        preset: 'ts-jest',
        displayName: 'node',
        testEnvironment: 'node',
        testRegex: 'test/.*\\.spec\\.ts',
      },
    ] as unknown[] as string[], // bad types

    // The root directory that Jest should scan for tests and modules within
    rootDir: 'test',

    // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    testPathIgnorePatterns: ['/node_modules/'],

    // Increase timeout since we have long running cryptographic functions
    testTimeout: Dates.minutes(6),
  }
}
