import { readFileSync } from 'fs'
import type { Reupload } from '../../src/command/reupload'
import type { Upload } from '../../src/command/upload'
import { HistoryItem } from '../../src/service/history/types/history-item'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'
import { Buy } from '../../src/command/stamp/buy'

describeCommand(
  'Test Reupload command',
  ({ consoleMessages, hasMessageContaining }) => {
    it('should reupload pinned content and add it to the upload history', async () => {
      // 1. Upload with --pin so there is locally pinned content
      const uploadBuilder = await invokeTestCli([
        'upload',
        `${__dirname}/../testpage/images/swarm.png`,
        '--pin',
        ...getStampOption(),
      ])
      const uploadCommand = uploadBuilder.runnable as Upload
      const reference = uploadCommand.result.getOrThrow().toHex()

      // assert the upload itself succeeded before moving on
      expect(uploadCommand.name).toBe('upload')
      expect(reference).toHaveLength(64)
      expect(hasMessageContaining('Swarm hash')).toBeTruthy()

      consoleMessages.length = 0 // clear messages from the upload

      // 2. buy a NEW stamp for the reupload
      const buyExecution = await invokeTestCli([
        'stamp',
        'buy',
        '--depth',
        '20',
        '--amount',
        '555m',
        '--wait-usable',
        '--yes',
      ])
      const newStampId = (buyExecution.runnable as Buy).postageBatchId.toHex()
      expect(newStampId).not.toBe(getStampOption()[1])

      consoleMessages.length = 0

      // 3. Reupload it
      const reuploadBuilder = await invokeTestCli(['reupload', reference, '--stamp', newStampId])
      expect(hasMessageContaining('Reuploaded successfully')).toBeTruthy()

      // 4. Verify the history entry
      const reuploadCommand = reuploadBuilder.runnable as Reupload
      const historyPath = (reuploadCommand as any).commandConfig.getHistoryFilePath()
      const items = JSON.parse(readFileSync(historyPath, 'utf-8')) as HistoryItem[]

      const lastItem = items[items.length - 1]
      expect(lastItem.reference).toBe(reference)
      expect(lastItem.uploadType).toBe('reupload')
      expect(lastItem.path).toBeNull()
      expect(lastItem.stamp).toBe(newStampId)
    })
  },
  { configFileName: 'reupload' },
)
