import fetch, { Response } from 'node-fetch'
import PackageJson from '../../package.json'
import { describeCommand, invokeTestCli } from '../utility'

jest.mock('node-fetch')
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>

describeCommand('Test Outdated Version Warning', ({ consoleMessages }) => {
  it('should print warning when version is outdated', async () => {
    process.env.SKIP_VERSION_CHECK = 'false'
    mockedFetch.mockResolvedValue({
      json: () => Promise.resolve({ tag_name: 'v999.0.0' }),
    } as unknown as Response)
    await invokeTestCli(['status'])
    expect(consoleMessages[2]).toContain(
      `A new version of swarm-cli is available: 999.0.0. You are using version ${PackageJson.version}. Please update to the latest version.`,
    )
    process.env.SKIP_VERSION_CHECK = 'true'
  })
})
