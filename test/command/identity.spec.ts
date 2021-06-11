import Wallet from 'ethereumjs-wallet'
import { access, writeFileSync } from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import { List } from '../../src/command/identity/list'
import { describeCommand, invokeTestCli } from '../utility'

describeCommand(
  'Test Identity command',
  ({ consoleMessages, configFolderPath }) => {
    const existFile = promisify(access)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const configFilePath = process.env.SWARM_CLI_CONFIG_FILE_PATH!

    it('should create default config on the first run', async () => {
      await invokeTestCli(['identity', 'list'])
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(await existFile(configFilePath)).toBeUndefined() //TODO why is it true for undefined?
    })

    it('should create V3 identity "main"', async () => {
      // create identity
      await invokeTestCli(['identity', 'create', '--password', '1234'])
      expect(consoleMessages[0]).toBe('Keypair has been generated successfully!')
    })

    it('should create simple identity "temporary-identity"', async () => {
      // create identity
      await invokeTestCli(['identity', 'create', 'temporary-identity', '--only-keypair'])
      expect(consoleMessages[0]).toBe('Keypair has been generated successfully!')
    })

    it('should list already created identities', async () => {
      // create identity
      const commandBuilder = await invokeTestCli(['identity', 'list'])
      expect(consoleMessages[0]).toContain('List of your identities')
      expect(consoleMessages[2]).toContain('Identity name')
      expect(consoleMessages[2]).toContain('main')
      expect(consoleMessages[6]).toContain('Identity name')
      expect(consoleMessages[6]).toContain('temporary-identity')
      const listCommand = commandBuilder.runnable as List
      expect(Object.keys(listCommand.commandConfig.config.identities)).toHaveLength(2)
      expect(listCommand.commandConfig.config.identities.main).toBeDefined()
      expect(listCommand.commandConfig.config.identities['temporary-identity']).toBeDefined()
    })

    it('should remove identity "temporary-identity"', async () => {
      // remove identity
      await invokeTestCli(['identity', 'remove', 'temporary-identity', '-f'])
      expect(consoleMessages[0]).toBe('Identity has been successfully removed')
      // check it removed from the identity list
      const commandBuilder = await invokeTestCli(['identity', 'list'])
      const listCommand = commandBuilder.runnable as List
      expect(Object.keys(listCommand.commandConfig.config.identities)).toHaveLength(1)
      expect(listCommand.commandConfig.config.identities['temporary-identity']).toBeUndefined()
    })

    it('should export v3 identity', async () => {
      // first create a v3 identity
      await invokeTestCli(['identity', 'create', 'v3-identity', '--password', 'test'])
      // then export it
      await invokeTestCli(['identity', 'export', 'v3-identity'])
      // and check if the last console message looked like a v3 wallet json
      const exportIndex = consoleMessages.length - 1
      expect(consoleMessages[exportIndex]).toContain('"ciphertext"')
    })

    it('should import v3 identity', async () => {
      // first save a v3 keystore to a file
      const wallet = Wallet.generate()
      const v3string = await wallet.toV3String('123')
      const path = join(configFolderPath, 'v3-keystore.json')
      writeFileSync(path, v3string)
      // then import it
      await invokeTestCli(['identity', 'import', path, '--identity-name', 'import-test', '--password', '123'])
      // and check for successful import message
      const successfulImportIndex = consoleMessages.length - 1
      expect(consoleMessages[successfulImportIndex]).toContain(
        "V3 Wallet imported as identity 'import-test' successfully",
      )
    })
  },
  { configFileName: 'config' },
)
