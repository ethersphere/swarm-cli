import inquirer from 'inquirer'
import { describeCommand, invokeTestCli } from '../utility'
import { existsSync, readFileSync, unlinkSync } from 'fs'
import fetch, { Response } from 'node-fetch'
jest.mock('node-fetch')

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>

function mockFetchSuccess() {
  mockedFetch.mockResolvedValue({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  } as unknown as Response)
}

describeCommand('Test Quickstart command', () => {
  afterEach(() => {
    for (const file of ['bee', 'bee.exe', 'bee.yaml']) {
      if (existsSync(file)) unlinkSync(file)
    }
  })
  it('should create bee.yml with default config', async () => {
    mockFetchSuccess()
    jest.spyOn(inquirer, 'prompt').mockResolvedValueOnce({ value: 'ultra-light' })

    await invokeTestCli(['quickstart'])
    expect(existsSync('bee.yaml')).toBe(true)
    const yaml = readFileSync('bee.yaml', 'utf8')
    expect(yaml).toContain('api-addr: 127.0.0.1:1633')
    expect(yaml).toContain('blockchain-rpc-endpoint: "https://xdai.fairdatasociety.org"')
    expect(yaml).toContain('cors-allowed-origins: ["*"]')
    expect(yaml).toContain(`data-dir: "${process.cwd()}/data-dir"`)
    expect(yaml).toContain('full-node: false')
    expect(yaml).toContain('mainnet: true')
    expect(yaml).toContain('resolver-options: ["https://ethereum-rpc.publicnode.com"]')
    expect(yaml).toContain('storage-incentives-enable: false')
    expect(yaml).toContain('swap-enable: false')
    expect(yaml).toContain('password:')
  })
})
