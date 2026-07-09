import fetch, { Response } from 'node-fetch'
import PackageJson from '../../package.json'
import { describeCommand, invokeTestCli } from '../utility'
import { existsSync, unlinkSync } from 'fs'

jest.mock('node-fetch')
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>

describeCommand('Test Outdated Version Warning', ({ hasMessageContaining }) => {
  afterEach(() => {
    if (existsSync('./test/testconfig/version-check.json')) {
      unlinkSync('./test/testconfig/version-check.json')
    }
  })
  it('should print warning when version is outdated', async () => {
    process.env.SKIP_VERSION_CHECK = 'false'
    mockedFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tag_name: 'v999.0.0' }),
    } as unknown as Response)
    await invokeTestCli(['status'])
    await invokeTestCli(['status'])
    expect(
      hasMessageContaining(
        `A new version of swarm-cli is available: 999.0.0. You are using version ${PackageJson.version}. Please update to get the latest features and fixes.`,
      ),
    ).toBe(true)
    process.env.SKIP_VERSION_CHECK = 'true'
  })
})
