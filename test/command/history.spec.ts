import chalk from 'chalk'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'
import { randomUUID } from 'crypto'

async function uploadTestFile() {
  const uploadFilePath = `${__dirname}/../testpage/images/swarm.png`
  await invokeTestCli(['upload', uploadFilePath, ...getStampOption()])
}

describeCommand('Test History command', ({ consoleMessages }) => {
  describe('list', () => {
    it('should have table header row', async () => {
      await invokeTestCli(['history', 'enable'])
      await invokeTestCli(['history', 'list'])
      expect(consoleMessages[1]).toContain('Timestamp')
      expect(consoleMessages[1]).toContain('Reference')
      expect(consoleMessages[1]).toContain('Postage stamp batch ID')
      expect(consoleMessages[1]).toContain('File path')
      expect(consoleMessages[1]).toContain('Upload type')
      await invokeTestCli(['history', 'disable', '--yes'])
    })

    it('should list history items', async () => {
      await invokeTestCli(['history', 'enable'])
      await uploadTestFile()
      await invokeTestCli(['history', 'list'])

      const tableString = consoleMessages[consoleMessages.length - 1]
      expect(tableString).toContain(' 1     ')
      expect(tableString).toContain('b4b1557e29c2')
      expect(tableString).toContain('testpage/images/swarm.png')
      expect(tableString).toContain('file')
      await invokeTestCli(['history', 'disable', '--yes'])
    })

    it('should show warning message if history tracking is not enabled', async () => {
      await invokeTestCli(['history', 'disable', '--yes'])
      await invokeTestCli(['history', 'list'])
      expect(consoleMessages[1]).toContain(
        'Upload history tracking is not enabled. Use "swarm-cli history enable" command to enable it.',
      )
    })
  })

  describe('show', () => {
    it('should show all detail for a certain history item', async () => {
      const identityName = randomUUID()
      await invokeTestCli(['identity', 'create', identityName, '--password', 'test'])
      await invokeTestCli(['history', 'enable'])
      await invokeTestCli([
        'feed',
        'upload',
        `${__dirname}/../testpage/images`,
        '--identity',
        identityName,
        '--topic-string',
        'test',
        '--password',
        'test',
        '--quiet',
        ...getStampOption(),
      ])
      await invokeTestCli(['history', 'show', '1'])

      expect(consoleMessages[8]).toContain('c86177d67756e097b')
      expect(consoleMessages[9]).toMatch(/[a-f0-9]{64}/g)
      expect(consoleMessages[10]).toContain('folder')
      expect(consoleMessages[11]).toContain('testpage/images')
      expect(consoleMessages[12]).toMatch(/[a-f0-9]{64}/g)
      expect(consoleMessages[13]).toContain(identityName)
      await invokeTestCli(['history', 'disable', '--yes'])
    })

    it('should show warning message if history tracking is not enabled', async () => {
      await invokeTestCli(['history', 'show', '1'])
      expect(consoleMessages[0]).toContain(
        'Upload history tracking is not enabled. Use "swarm-cli history enable" command to enable it.',
      )
    })
  })

  describe('enable', () => {
    it('should enable history tracking', async () => {
      await invokeTestCli(['history', 'enable'])
      expect(consoleMessages[0]).toContain('Upload history tracking enabled')
    })

    it('should not enable history tracking if it is already enabled', async () => {
      await invokeTestCli(['history', 'enable'])
      await invokeTestCli(['history', 'enable'])
      expect(consoleMessages[1]).toContain('Upload history tracking is already enabled')
      await invokeTestCli(['history', 'disable', '--yes'])
    })
  })

  describe('disable', () => {
    it('should disable history tracking', async () => {
      await invokeTestCli(['history', 'enable'])
      await invokeTestCli(['history', 'disable', '--yes'])
      expect(consoleMessages[1]).toContain('Upload history file deleted')
      expect(consoleMessages[2]).toContain('Upload history tracking disabled')
    })

    it('should not disable history tracking if it is already disabled', async () => {
      await invokeTestCli(['history', 'disable', '--yes'])
      expect(consoleMessages[0]).toContain('Upload history tracking is already disabled and no history file exists')
    })
  })

  describe('status', () => {
    it('should show history tracking status', async () => {
      await invokeTestCli(['history', 'status'])
      expect(consoleMessages[0]).toEqual(chalk.green.bold('Upload history tracking status:'))
      expect(consoleMessages[1]).toContain('inactive')
      await invokeTestCli(['history', 'enable'])
      await uploadTestFile()
      await invokeTestCli(['history', 'status'])
      expect(consoleMessages[9]).toContain('active')
      expect(consoleMessages[10]).toContain('/test/testconfig/upload-history.json')
      expect(consoleMessages[11]).toEqual('Number of history entries: 1')
      await invokeTestCli(['history', 'disable', '--yes'])
    })
  })
})
