import { writeFileSync } from 'fs'
import { join } from 'path'
import { describeCommand, invokeTestCli } from '../utility'

describeCommand(
  'Test configuration loading',
  ({ consoleMessages, configFolderPath }) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const configFilePath = process.env.SWARM_CLI_CONFIG_FILE_PATH!

    it('should use config when env is not specified', async () => {
      delete process.env.BEE_DEBUG_API_URL

      writeFileSync(
        configFilePath,
        JSON.stringify({
          beeDebugApiUrl: 'http://localhost:30003',
        }),
      )

      await invokeTestCli(['cheque', 'list'])
      expect(consoleMessages[1]).toContain('http://localhost:30003')
    })

    it('should use env over config when specified', async () => {
      process.env.BEE_DEBUG_API_URL = 'http://localhost:30002'

      await invokeTestCli(['cheque', 'list'])
      expect(consoleMessages[1]).toContain('http://localhost:30002')
    })

    it('should use explicit option over all', async () => {
      await invokeTestCli(['cheque', 'list', '--bee-debug-api-url', 'http://localhost:30001'])
      expect(consoleMessages[1]).toContain('http://localhost:30001')
    })

    it('should read config path explicitly, then use it for url', async () => {
      delete process.env.BEE_DEBUG_API_URL

      writeFileSync(
        join(configFolderPath, 'config2.config.json'),
        JSON.stringify({
          beeDebugApiUrl: 'http://localhost:30004',
        }),
      )

      await invokeTestCli(['cheque', 'list', '--config-file', 'config2.config.json'])
      expect(consoleMessages[1]).toContain('http://localhost:30004')
    })
  },
  { configFileName: 'test-config' },
)
