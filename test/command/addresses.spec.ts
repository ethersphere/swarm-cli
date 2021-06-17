import { describeCommand, invokeTestCli } from '../utility'

describeCommand(
  'Test Addresses command',
  ({ consoleMessages }) => {
    it('should print addresses', async () => {
      await invokeTestCli(['addresses'])
      expect(consoleMessages[2]).toMatch(/0x[0-9a-f]{10}/i)
      expect(consoleMessages[3]).toMatch(/[0-9a-f]{10}/i)
      expect(consoleMessages[4]).toMatch(/[0-9a-f]{10}/i)
      expect(consoleMessages[5]).toMatch(/[0-9a-f]{10}/i)
      expect(consoleMessages[6]).toContain('/ip4/')
      expect(consoleMessages[10]).toMatch(/0x[0-9a-f]{10}/i)
    })

    it('should be splittable in quiet mode', async () => {
      await invokeTestCli(['addresses', '-q'])
      expect(consoleMessages[0].split(' ')[1]).toMatch(/0x[0-9a-f]{10}/i)
      expect(consoleMessages[1].split(' ')[1]).toMatch(/[0-9a-f]{10}/i)
      expect(consoleMessages[2].split(' ')[1]).toMatch(/[0-9a-f]{10}/i)
      expect(consoleMessages[3].split(' ')[1]).toMatch(/[0-9a-f]{10}/i)
      expect(consoleMessages[4].split(' ')[1]).toContain('/ip4/')
      expect(consoleMessages[5].split(' ')[1]).toMatch(/0x[0-9a-f]{10}/i)
    })
  },
  { configFileName: 'addresses' },
)
