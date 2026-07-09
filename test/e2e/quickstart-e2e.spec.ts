import inquirer from 'inquirer'
import { mkdirSync, rmSync } from 'fs'
import { describeCommand, invokeTestCli } from '../utility'
import { spawn } from 'child_process'

describeCommand('Test Quickstart command end-to-end', ({ hasMessageContaining, getLastMessage }) => {
  it('should run through the quickstart flow', async () => {
    mkdirSync('./tmp')

    const originalCwd = process.cwd()
    process.chdir('./tmp')
    jest.spyOn(inquirer, 'prompt').mockResolvedValueOnce({ value: 'ultra-light' })
    await invokeTestCli(['quickstart'])
    process.chdir(originalCwd)
    expect(getLastMessage()).toContain('./bee start --config=bee.yaml')

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
    const node = spawn('./bee', ['start', '--config=bee.yaml'], { cwd: './tmp' })
    try {
      await (async () => {
        for (let i = 0; i < 30; i++) {
          await invokeTestCli(['status'])

          if (hasMessageContaining('[OK]')) return
          await sleep(1000)
        }
        throw new Error('Node did not start in time')
      })()
    } finally {
      node.kill('SIGINT')
      await new Promise(resolve => node.on('exit', resolve))
      rmSync('./tmp', { recursive: true, force: true })
    }
  })
})
