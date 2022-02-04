import { List } from '../../src/command/identity/list'
import { fileExists } from '../../src/utils'
import { describeCommand, invokeTestCli } from '../utility'

describeCommand(
  'Test Identity command',
  ({ consoleMessages, getNthLastMessage, hasMessageContaining, getLastMessage }) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const configFilePath = process.env.SWARM_CLI_CONFIG_FILE_PATH!

    it('should create default config on the first run', async () => {
      await invokeTestCli(['identity', 'list'])
      expect(fileExists(configFilePath)).toBe(true)
    })

    it('should create V3 identity "main"', async () => {
      await invokeTestCli(['identity', 'create', '--password', '1234'])
      expect(consoleMessages[1]).toContain('Name')
      expect(consoleMessages[1]).toContain('main')
      expect(consoleMessages[2]).toContain('Type')
      expect(consoleMessages[2]).toContain('V3 Wallet')
    })

    it('should create simple identity "temporary-identity"', async () => {
      await invokeTestCli(['identity', 'create', 'temporary-identity', '--only-keypair'])
      expect(consoleMessages[0]).toContain('Name')
      expect(consoleMessages[0]).toContain('temporary-identity')
      expect(consoleMessages[1]).toContain('Type')
      expect(consoleMessages[1]).toContain('Private Key')
    })

    it('should list already created identities', async () => {
      const commandBuilder = await invokeTestCli(['identity', 'list'])
      expect(consoleMessages[0]).toContain('Name')
      expect(consoleMessages[0]).toContain('main')
      expect(consoleMessages[4]).toContain('Name')
      expect(consoleMessages[4]).toContain('temporary-identity')
      const listCommand = commandBuilder.runnable as List
      expect(Object.keys(listCommand.commandConfig.config.identities)).toHaveLength(2)
      expect(listCommand.commandConfig.config.identities.main).toBeDefined()
      expect(listCommand.commandConfig.config.identities['temporary-identity']).toBeDefined()
    })

    it('should remove identity "temporary-identity"', async () => {
      // remove identity
      await invokeTestCli(['identity', 'remove', 'temporary-identity', '--yes'])
      expect(consoleMessages[0]).toBe("Identity 'temporary-identity' has been successfully deleted")
      // check it removed from the identity list
      const commandBuilder = await invokeTestCli(['identity', 'list'])
      const listCommand = commandBuilder.runnable as List
      expect(Object.keys(listCommand.commandConfig.config.identities)).toHaveLength(1)
      expect(listCommand.commandConfig.config.identities['temporary-identity']).toBeUndefined()
    })

    it('should import v3 identity', async () => {
      await invokeTestCli([
        'identity',
        'import',
        'test/data/TestIdentity.json',
        '-P',
        'TestPassword',
        '--name',
        'Sample 1',
      ])
      expect(getLastMessage()).toBe("V3 Wallet imported as identity 'Sample 1' successfully")
    })

    it('should import private key identity as string', async () => {
      await invokeTestCli([
        'identity',
        'import',
        '0x944b0a2e488eddfb11d0666cb144f2c47f5ec2374a94fb637bec7c9f9fe74b8a',
        '--name',
        'Sample 2',
        '--yes',
      ])
      expect(getLastMessage()).toBe("Private key imported as identity 'Sample 2' successfully")
    })

    it('should import private key identity as path', async () => {
      await invokeTestCli(['identity', 'import', 'test/data/TestIdentity.txt', '--name', 'Sample 3', '--yes'])
      expect(getLastMessage()).toBe("Private key imported as identity 'Sample 3' successfully")
    })

    it('should import private key identity and convert to v3', async () => {
      await invokeTestCli([
        'identity',
        'import',
        'test/data/TestIdentity.txt',
        '--name',
        'Sample 4',
        '-P',
        'TestPassword',
      ])
      expect(getLastMessage()).toBe("V3 Wallet imported as identity 'Sample 4' successfully")
    })

    it('should export v3 identity', async () => {
      await invokeTestCli([
        'identity',
        'import',
        'test/data/TestIdentity.json',
        '--name',
        'Sample 5',
        '-P',
        'TestPassword',
      ])
      await invokeTestCli(['identity', 'export', 'Sample 5'])
      expect(hasMessageContaining('"address": "839b825c908fff5e4b51d97893f2fe64422f8978"')).toBeTruthy()
    })

    it('should export private key identity', async () => {
      await invokeTestCli(['identity', 'import', 'test/data/TestIdentity.txt', '--name', 'Sample 6', '--yes'])
      await invokeTestCli(['identity', 'export', 'Sample 6'])
      expect(getLastMessage()).toBe('0x944b0a2e488eddfb11d0666cb144f2c47f5ec2374a94fb637bec7c9f9fe74b8a')
    })

    it('should show v3 identity', async () => {
      await invokeTestCli([
        'identity',
        'import',
        'test/data/TestIdentity.json',
        '--name',
        'Sample 7',
        '-P',
        'TestPassword',
      ])
      await invokeTestCli(['identity', 'show', 'Sample 7', '--yes', '-P', 'TestPassword'])
      expect(getNthLastMessage(3)).toContain('Private key')
      expect(getNthLastMessage(3)).toContain('0x560feedcad2979e64dd067f67220b5aeca62e8df8e6dda741bb1b20b8144cb1f')
      expect(getNthLastMessage(2)).toContain('Public key')
      expect(getNthLastMessage(2)).toContain(
        '0xcf4bf25f18ca58aef479506234941661789c2932dc5100b1b6f205a840c4912b9a5be1840d608b25c0f01291a0d5952a549b0b9b3c2117f97f63df3fa5ed0921',
      )
      expect(getNthLastMessage(1)).toContain('Address')
      expect(getNthLastMessage(1)).toContain('0x839b825c908fff5e4b51d97893f2fe64422f8978')
    })

    it('should show private key identity', async () => {
      await invokeTestCli(['identity', 'import', 'test/data/TestIdentity.txt', '--name', 'Sample 8', '--yes'])
      await invokeTestCli(['identity', 'show', 'Sample 8', '--yes'])
      expect(getNthLastMessage(3)).toContain('Private key')
      expect(getNthLastMessage(3)).toContain('0x944b0a2e488eddfb11d0666cb144f2c47f5ec2374a94fb637bec7c9f9fe74b8a')
      expect(getNthLastMessage(2)).toContain('Public key')
      expect(getNthLastMessage(2)).toContain(
        '0x2350995bb550f6967e79fc5126803981c8fada9c8c1330ad5459ea3cbbefa2284e3447961547c2ad62756629c8085e1563174c259077a2f351cf65f14575a565',
      )
      expect(getNthLastMessage(1)).toContain('Address')
      expect(getNthLastMessage(1)).toContain('0xb9dea25cf402403d1429141f4a39afd89897668a')
    })

    it('should rename identity', async () => {
      await invokeTestCli(['identity', 'import', 'test/data/TestIdentity.txt', '--name', 'Sample 9', '--yes'])
      await invokeTestCli(['identity', 'rename', 'Sample 9', 'Renamed Sample 9'])
      await invokeTestCli(['identity', 'show', 'Renamed Sample 9', '--yes'])
      expect(getLastMessage()).toContain('Address')
      expect(getLastMessage()).toContain('0xb9dea25cf402403d1429141f4a39afd89897668a')
    })

    it('should not rename identity with name conflict', async () => {
      await invokeTestCli(['identity', 'import', 'test/data/TestIdentity.txt', '--name', 'Sample 10', '--yes'])
      await invokeTestCli(['identity', 'import', 'test/data/TestIdentity.txt', '--name', 'Sample 11', '--yes'])
      await invokeTestCli(['identity', 'rename', 'Sample 10', 'Sample 11'])
      expect(getLastMessage()).toContain("An identity with the name 'Sample 11' already exists")
    })

    it('should not rename identity when it does not exist', async () => {
      await invokeTestCli(['identity', 'rename', 'Sample 12', 'Sample 13'])
      expect(getLastMessage()).toContain("No identity found with the name 'Sample 12'")
    })
  },
  { configFileName: 'config' },
)
