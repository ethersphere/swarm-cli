import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describeCommand('--curl flag', ({ consoleMessages }) => {
  it('should print upload command', async () => {
    await invokeTestCli(['upload', 'test/testpage/index.html', '--curl', ...getStampOption()])
    expect(consoleMessages[0]).toContain('curl -X POST http://localhost:1633/tags ')
    expect(consoleMessages[1]).toContain('curl -X POST http://localhost:1633/bzz?name=index.html ')
    expect(consoleMessages[1]).toContain(`-H "swarm-postage-batch-id: ${getStampOption()[1]}`)
    expect(consoleMessages[1]).toContain('-H "content-length: 220"')
    expect(consoleMessages[1]).toContain('-H "swarm-tag: ')
    expect(consoleMessages[1]).toContain('--data "<stream>"')
    expect(consoleMessages[1]).not.toContain('swarm-encrypt')
  })

  it('should print upload command with encryption', async () => {
    await invokeTestCli(['upload', 'test/testpage/index.html', '--encrypt', '--curl', ...getStampOption()])
    expect(consoleMessages[0]).toContain('curl -X POST http://localhost:1633/tags ')
    expect(consoleMessages[1]).toContain('curl -X POST http://localhost:1633/bzz?name=index.html ')
    expect(consoleMessages[1]).toContain(`-H "swarm-postage-batch-id: ${getStampOption()[1]}`)
    expect(consoleMessages[1]).toContain('-H "content-length: 220"')
    expect(consoleMessages[1]).toContain('-H "swarm-tag: ')
    expect(consoleMessages[1]).toContain('-H "swarm-encrypt: true"')
    expect(consoleMessages[1]).toContain('--data "<stream>"')
  })
})
