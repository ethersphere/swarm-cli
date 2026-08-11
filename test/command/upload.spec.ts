import { MerkleTree } from '@ethersphere/bee-js'
import { System } from 'cafe-utility'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { LeafCommand } from 'furious-commander'
import QRCode from 'qrcode'
import { Readable } from 'stream'
import type { Upload } from '../../src/command/upload'
import { toBeQRCode, toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

// process.stdin is a real, singleton stream - once ended via push(null) it can never
// accept more data, so a test suite that uploads from stdin more than once needs a
// fresh stream per call rather than reusing the real one.
async function invokeTestCliWithStdin(argv: string[], data: Buffer): ReturnType<typeof invokeTestCli> {
  const stream = new Readable({
    read: () => {
      // no-op: all data is pushed upfront below, nothing to pull on demand
    },
  })
  stream.push(data)
  stream.push(null)

  const original = process.stdin
  Object.defineProperty(process, 'stdin', { value: stream, configurable: true })
  try {
    return await invokeTestCli(argv)
  } finally {
    Object.defineProperty(process, 'stdin', { value: original, configurable: true })
  }
}

const SUCCESSFUL_SYNC_PATTERN = [
  ['Data has been sent to the Bee node successfully!'],
  ['Waiting for file chunks to be synced on Swarm network...'],
  ['Data has been synced on Swarm network'],
  ['Uploading was successful!'],
]

expect.extend({
  toMatchLinesInOrder,
  toBeQRCode,
})

function actUpload(command: { runnable?: LeafCommand | undefined }): [string, string] {
  const uploadCommand = command.runnable as Upload
  const ref = uploadCommand.result.getOrThrow().toHex()
  const his = uploadCommand.historyAddress.getOrThrow().toHex()

  return [ref, his]
}

describeCommand(
  'Test Upload command',
  ({ consoleMessages, hasMessageContaining, getLastMessage }) => {
    if (existsSync('test/data/8mb.bin')) {
      unlinkSync('test/data/8mb.bin')
    }

    writeFileSync('test/data/8mb.bin', Buffer.alloc(8_000_000))

    it('should upload testpage folder', async () => {
      const commandKey = 'upload'
      const uploadFolderPath = `${__dirname}/../testpage`
      const commandBuilder = await invokeTestCli([commandKey, uploadFolderPath, ...getStampOption()])

      expect(commandBuilder.initedCommands[0]!.command.name).toBe('upload')
      const command = commandBuilder.initedCommands[0]!.command as Upload
      expect(command.result.getOrThrow().toHex().length).toBe(64)
    })

    it('should upload file', async () => {
      const commandKey = 'upload'
      const uploadFolderPath = `${__dirname}/../testpage/images/swarm.png`
      const commandBuilder = await invokeTestCli([commandKey, uploadFolderPath, ...getStampOption()])

      expect(commandBuilder.initedCommands[0]!.command.name).toBe('upload')
      const command = commandBuilder.initedCommands[0]!.command as Upload
      expect(command.result.getOrThrow().toHex().length).toBe(64)
    })

    it('should upload file and encrypt', async () => {
      const commandBuilder = await invokeTestCli(['upload', 'README.md', '--encrypt', ...getStampOption()])
      const uploadCommand = commandBuilder.runnable as Upload
      expect(uploadCommand.result.getOrThrow().toHex()).toHaveLength(128)
    })

    describe('when --share-with flag provided', () => {
      afterEach(() => {
        const historyFilePath = `${__dirname}/../testconfig/upload-access-history.json`

        if (existsSync(historyFilePath)) {
          unlinkSync(historyFilePath)
        }
      })
      it('should upload file and share with the provided grantee list', async () => {
        await invokeTestCli(['access', 'init', ...getStampOption(), '--list-name', 'test-share-with'])
        await System.sleepMillis(1000)
        const commandBuilder = await invokeTestCli([
          'upload',
          'README.md',
          '--share-with',
          'test-share-with',
          ...getStampOption(),
        ])

        const [ref, his] = actUpload(commandBuilder)
        expect(ref).toHaveLength(64)
        expect(his).toHaveLength(64)
      })
    })

    describe('redundancy level', () => {
      // needs to be big enough to span multiple chunks - redundancy only encodes
      // the intermediate tree, so a single-chunk file would show no difference at all
      const REDUNDANT_FILE = 'test/testpage/images/swarm.png'

      it('should upload without any redundancy when --redundancy OFF is passed', async () => {
        const data = readFileSync(REDUNDANT_FILE)
        const commandBuilder = await invokeTestCliWithStdin(
          ['upload', '--stdin', '--redundancy', 'OFF', ...getStampOption()],
          data,
        )
        const uploadCommand = commandBuilder.runnable as Upload

        const bareRootChunk = await MerkleTree.root(new Uint8Array(data))
        const bareReference = Buffer.from(bareRootChunk.hash()).toString('hex')

        expect(uploadCommand.result.getOrThrow().toHex()).toBe(bareReference)
      })

      it('should produce a different reference than --redundancy OFF when a higher level is requested', async () => {
        const offBuilder = await invokeTestCli([
          'upload',
          REDUNDANT_FILE,
          '--redundancy',
          'OFF',
          '--yes',
          ...getStampOption(),
        ])
        const offReference = (offBuilder.runnable as Upload).result.getOrThrow().toHex()

        // MEDIUM (unlike OFF) prints overhead stats and prompts for confirmation
        // unless --yes is passed, which would otherwise hang waiting on stdin here.
        const mediumBuilder = await invokeTestCli([
          'upload',
          REDUNDANT_FILE,
          '--redundancy',
          'MEDIUM',
          '--yes',
          ...getStampOption(),
        ])
        const mediumReference = (mediumBuilder.runnable as Upload).result.getOrThrow().toHex()

        expect(mediumReference).not.toBe(offReference)
      })

      it('should reject an invalid redundancy level', async () => {
        await invokeTestCli(['upload', 'test/message.txt', '--redundancy', 'NOT_A_LEVEL', ...getStampOption()])
        expect(hasMessageContaining('Invalid redundancy level')).toBeTruthy()
      })
    })

    it('should upload folder and encrypt', async () => {
      const commandBuilder = await invokeTestCli(['upload', 'test/testpage', '--encrypt', ...getStampOption()])
      const uploadCommand = commandBuilder.runnable as Upload
      expect(uploadCommand.result.getOrThrow().toHex()).toHaveLength(128)
    })

    it('should not allow --encrypt for gateways', async () => {
      await invokeTestCli([
        'upload',
        'README.md',
        '--bee-api-url',
        'https://api.gateway.ethswarm.org',
        '--encrypt',
        ...getStampOption(),
      ])
      expect(hasMessageContaining('does not support encryption')).toBeTruthy()
    })

    it('should not allow --pin for gateways', async () => {
      await invokeTestCli([
        'upload',
        'README.md',
        '--bee-api-url',
        'https://api.gateway.ethswarm.org',
        '--pin',
        ...getStampOption(),
      ])
      expect(hasMessageContaining('does not support pinning')).toBeTruthy()
    })

    it('should not allow sync for gateways', async () => {
      await invokeTestCli([
        'upload',
        'README.md',
        '--sync',
        '--bee-api-url',
        'https://api.gateway.ethswarm.org',
        '--encrypt',
        ...getStampOption(),
      ])
      expect(hasMessageContaining('does not support syncing')).toBeTruthy()
    })

    it('should succeed with --sync <1MB', async () => {
      await invokeTestCli(['upload', 'README.md', '--sync', '-v', ...getStampOption()])
      expect(consoleMessages).toMatchLinesInOrder(SUCCESSFUL_SYNC_PATTERN)
    })

    it('should succeed with --sync >1MB', async () => {
      await invokeTestCli(['upload', 'docs/stamp-buy.gif', '--sync', '-v', ...getStampOption()])
      expect(consoleMessages).toMatchLinesInOrder(SUCCESSFUL_SYNC_PATTERN)
    })

    it('should succeed with --sync and --encrypt <1MB', async () => {
      await invokeTestCli(['upload', 'README.md', '--sync', '--encrypt', '-v', ...getStampOption()])
      expect(consoleMessages).toMatchLinesInOrder(SUCCESSFUL_SYNC_PATTERN)
    })

    it('should succeed with --sync and --encrypt >1MB', async () => {
      await invokeTestCli(['upload', 'docs/stamp-buy.gif', '--sync', '--encrypt', '-v', ...getStampOption()])
      expect(consoleMessages).toMatchLinesInOrder(SUCCESSFUL_SYNC_PATTERN)
    })

    it('should not print double trailing slashes', async () => {
      await invokeTestCli(['upload', 'README.md', '--bee-api-url', 'http://localhost:1633/', ...getStampOption()])
      expect(hasMessageContaining(':1633/bzz')).toBeTruthy()
      expect(hasMessageContaining('//bzz')).toBeFalsy()
    })

    it('should be able to upload text file', async () => {
      await invokeTestCli(['upload', 'test/message.txt', ...getStampOption()])
      expect(consoleMessages[0]).toContain('Swarm hash')
    })

    describe('when --qr flag provided', () => {
      it('should print QR code to the console', async () => {
        await invokeTestCli(['upload', 'test/message.txt', '--qr', ...getStampOption()])
        expect(hasMessageContaining('QR for URL:')).toBeTruthy()
        expect(getLastMessage()).toBeQRCode()
      })

      describe('when the URL is local', () => {
        it('should change the URL to use gateway', async () => {
          jest.spyOn(QRCode, 'toString')
          await invokeTestCli(['upload', 'test/message.txt', '--qr', ...getStampOption()])
          expect(QRCode.toString).toHaveBeenCalledWith(
            expect.stringContaining('https://api.gateway.ethswarm.org/bzz/'),
            { type: 'terminal', small: true },
          )
        })
      })
    })

    describe('when using stdin and bee-api-url is a gateway', () => {
      it('should not require stamp option', async () => {
        process.stdin.push('test content')
        process.stdin.push(null) // Signal end of input
        await invokeTestCli(['upload', '--stdin', '--bee-api-url', 'https://api.gateway.ethswarm.org'])
        expect(consoleMessages[0]).toContain('Swarm hash')
      })
    })
  },
  { configFileName: 'upload' },
)
