import { existsSync, mkdirSync, unlinkSync } from 'fs'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'
import { randomUUID } from 'crypto'

describeCommand('Test History command', ({ consoleMessages }) => {
  describe('list', () => {
    it('should have table header row', async () => {
      await invokeTestCli(['history', 'list'])
      expect(consoleMessages[0]).toContain('Timestamp')
      expect(consoleMessages[0]).toContain('Reference')
      expect(consoleMessages[0]).toContain('Postage stamp batch ID')
      expect(consoleMessages[0]).toContain('File path')
      expect(consoleMessages[0]).toContain('Upload type')
    })

    it('should list history items', async () => {
      mkdirSync('./tmp', { recursive: true })
      const uploadFolderPath = `${__dirname}/../testpage`
      await invokeTestCli(['upload', uploadFolderPath, ...getStampOption()])
      await invokeTestCli(['history', 'list'])

      const tableString = consoleMessages[consoleMessages.length - 1]
      expect(tableString).toContain(' 1     ')
      expect(tableString).toContain('ebf7f8633bd9')
      expect(tableString).toContain('d0fa09...ffe45a')
      expect(tableString).toContain('testpage')
      expect(tableString).toContain('file')
    })
  })

  describe('show', () => {
    it('should show all detail for a certain history item', async () => {
      mkdirSync('./tmp', { recursive: true })
      const identityName = randomUUID()
      await invokeTestCli(['identity', 'create', identityName, '--password', 'test'])
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

      expect(consoleMessages[7]).toContain('c86177d67756e097b')
      expect(consoleMessages[8]).toContain('d0fa0927288435d000b35d91717b0eacb8bd734619dcabf1b36ff35c2fffe45a')
      expect(consoleMessages[9]).toContain('folder')
      expect(consoleMessages[10]).toContain('testpage/images')
      expect(consoleMessages[11]).toMatch(/[a-f0-9]{64}/g)
      expect(consoleMessages[12]).toContain(identityName)
    })
  })

  afterEach(() => {
    if (process.env.SWARM_CLI_HISTORY_FILE_PATH && existsSync(process.env.SWARM_CLI_HISTORY_FILE_PATH)) {
      unlinkSync(process.env.SWARM_CLI_HISTORY_FILE_PATH || '')
    }
  })
})
