/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
import type { Config } from '@jest/types'
import { Dates, System } from 'cafe-utility'
import { CommandLog, VerbosityLevel } from './src/command/root-command/command-log'
import { Bee } from '@ethersphere/bee-js'

export default async (): Promise<Config.InitialOptions> => {
  const port = 1633
  const bee = new Bee(`http://localhost:${port}`)
  const console = new CommandLog(VerbosityLevel.Normal)

  const startedAt = Date.now()
  console.log('Waiting for Bee node to warm up on port', port)

  await System.waitFor(async () => (await bee.getStatus()).isWarmingUp === false, {
    attempts: 300,
    waitMillis: Dates.seconds(1),
    requiredConsecutivePasses: 3,
  })
  const elapsed = Date.now() - startedAt
  console.log(`Bee node on port ${port} warmed up in ${elapsed} milliseconds`)

  return {
    collectCoverage: false,
    forceExit: true,

    // Run tests from one or more projects
    projects: [
      {
        preset: 'ts-jest',
        displayName: 'node',
        testEnvironment: 'node',
        testRegex: 'test/e2e/.*\\.spec\\.ts',
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
