import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Upload } from '../../src/command/upload'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'
import { readFileSync } from 'node:fs'
const fs = require('fs')
const path = require('path')

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), 'swarm-cli-testrun-'))
}

describeCommand('Test Download command', ({ consoleMessages }) => {
  it('should download and print to stdout', async () => {
    const file = 'message.txt'
    const invocation = await invokeTestCli(['upload', 'test/'+file, ...getStampOption()])
    const hash = (invocation.runnable as Upload).result.getOrThrow()
    consoleMessages.length = 0
    await invokeTestCli(['download', hash.toHex(), '--stdout'])
    expect(consoleMessages[0]).toContain('OK')
    const fileContent = readFileSync(join(hash.toHex(), file), 'utf-8')
    expect(fileContent).toContain('Hello Swarm!')
  })

  it('should fall back to manifest download', async () => {
    const tmpDir = makeTmpDir()
    const invocation = await invokeTestCli(['upload', 'test/testpage', ...getStampOption()])
    const hash = (invocation.runnable as Upload).result.getOrThrow()
    consoleMessages.length = 0
    await invokeTestCli(['download', hash.toHex(), tmpDir])
    expect(consoleMessages[0]).toContain('images/swarm.png')
    expect(consoleMessages[2]).toContain('index.html')
    expect(consoleMessages[4]).toContain('swarm.bzz')
  })

  it('should ignore --stdout if downloading folder', async () => {
    const tmpDir = makeTmpDir()
    const invocation = await invokeTestCli(['upload', 'test/testpage', ...getStampOption()])
    const hash = (invocation.runnable as Upload).result.getOrThrow()
    consoleMessages.length = 0
    await invokeTestCli(['download', hash.toHex(), tmpDir, '--stdout'])
    expect(consoleMessages[0]).toContain('OK')
    expect(consoleMessages[1]).toContain('OK')
    expect(consoleMessages[2]).toContain('OK')
    expect(fs.existsSync(join(tmpDir, 'images/swarm.png'))).toBe(true)
    expect(fs.existsSync(join(tmpDir, 'index.html'))).toBe(true)
    expect(fs.existsSync(join(tmpDir, 'swarm.bzz'))).toBe(true)
  })
})
