import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describeCommand('--curl flag', ({ consoleMessages }) => {
  it('should print upload command without encryption', async () => {
    await invokeTestCli(['upload', 'test/testpage/index.html', '--curl', ...getStampOption()])
    expect(consoleMessages[0]).toContain('curl -X POST http://localhost:1633/bzz?name=index.html ')
    expect(consoleMessages[0]).toContain(`-H "swarm-postage-batch-id: ${getStampOption()[1]}`)
    expect(consoleMessages[0]).toContain('-H "content-length: 220"')
    expect(consoleMessages[0]).toContain('-H "swarm-tag: ')
    expect(consoleMessages[0]).not.toContain('swarm-encrypt')
  })

  it('should print upload command with encryption', async () => {
    await invokeTestCli(['upload', 'test/testpage/index.html', '--encrypt', '--curl', ...getStampOption()])
    expect(consoleMessages[0]).toContain('curl -X POST http://localhost:1633/bzz?name=index.html ')
    expect(consoleMessages[0]).toContain(`-H "swarm-postage-batch-id: ${getStampOption()[1]}`)
    expect(consoleMessages[0]).toContain('-H "content-length: 220"')
    expect(consoleMessages[0]).toContain('-H "swarm-tag: ')
    expect(consoleMessages[0]).toContain('-H "swarm-encrypt: true"')
  })

  it('should print <stream> for files', async () => {
    await invokeTestCli(['upload', 'test/testpage/index.html', '--curl', ...getStampOption()])
    expect(consoleMessages[0]).toContain('curl -X POST http://localhost:1633/bzz?name=index.html ')
    expect(consoleMessages[0]).toContain('--data "<stream>"')
  })

  it('should print <buffer> for directories', async () => {
    await invokeTestCli(['upload', 'test/testpage/', '--curl', ...getStampOption()])
    expect(consoleMessages[0]).toContain('curl -X POST http://localhost:1633/bzz ')
    expect(consoleMessages[0]).toContain('--data "<buffer>"')
  })

  it('should not print undefined params', async () => {
    await invokeTestCli(['upload', 'test/testpage/index.html', '--curl', '--drop-name', ...getStampOption()])
    expect(consoleMessages[0]).toContain('curl -X POST http://localhost:1633/bzz ')
    expect(consoleMessages[0]).toContain('--data "<stream>"')
  })
})
