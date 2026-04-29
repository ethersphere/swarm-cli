/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
import type { Config } from '@jest/types'
import { Dates } from 'cafe-utility'
import { CommandLog, VerbosityLevel } from './src/command/root-command/command-log'

export default async (): Promise<Config.InitialOptions> => {
  const console = new CommandLog(VerbosityLevel.Normal)
  console.log('Running e2e tests')

  return {
    collectCoverage: false,

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
