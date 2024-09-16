import { toMatchLinesInOrder } from '../custom-matcher'
import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

expect.extend({
  toMatchLinesInOrder,
})

describeCommand('--curl flag', ({ consoleMessages }) => {
  it('should print upload command without encryption', async () => {
    await invokeTestCli(['upload', 'test/testpage/index.html', '--curl', ...getStampOption()])
    expect(consoleMessages).toMatchLinesInOrder([
      [
        'curl -X POST "http://localhost:1633/bzz?name=index.html" ',
        `-H "swarm-postage-batch-id: ${getStampOption()[1]}`,
      ],
    ])
    expect(consoleMessages.every(x => !x.includes('swarm-encrypt'))).toBeTruthy()
  })

  it('should print upload command with encryption', async () => {
    await invokeTestCli(['upload', 'test/testpage/index.html', '--encrypt', '--curl', ...getStampOption()])
    expect(consoleMessages).toMatchLinesInOrder([
      [
        'curl -X POST "http://localhost:1633/bzz?name=index.html" ',
        `-H "swarm-postage-batch-id: ${getStampOption()[1]}`,
        '-H "swarm-encrypt: true"',
      ],
    ])
  })

  it('should print file', async () => {
    await invokeTestCli(['upload', 'test/testpage/index.html', '--curl', ...getStampOption()])
    expect(consoleMessages).toMatchLinesInOrder([
      ['curl -X POST "http://localhost:1633/bzz?name=index.html" ', '--data @test/testpage/index.html'],
    ])
  })

  it('should print <buffer> for directories', async () => {
    await invokeTestCli(['upload', 'test/testpage/', '--curl', ...getStampOption()])
    expect(consoleMessages).toMatchLinesInOrder([['curl -X POST "http://localhost:1633/bzz"', '--data <buffer>']])
  })

  it('should not print undefined params', async () => {
    await invokeTestCli(['upload', 'test/testpage/index.html', '--curl', '--drop-name', ...getStampOption()])
    expect(consoleMessages).toMatchLinesInOrder([
      ['curl -X POST "http://localhost:1633/bzz"', '--data @test/testpage/index.html'],
    ])
  })

  it('should detect content type', async () => {
    await invokeTestCli(['upload', 'test/testpage/index.html', '--curl', ...getStampOption()])
    expect(consoleMessages).toMatchLinesInOrder([['-H "content-type: text/html"']])
  })

  it('should use custom content type', async () => {
    await invokeTestCli([
      'upload',
      'test/testpage/index.html',
      '--content-type',
      'swarm/bzz',
      '--curl',
      ...getStampOption(),
    ])
    expect(consoleMessages).toMatchLinesInOrder([['-H "content-type: swarm/bzz"']])
  })

  it('should fall back with undetectable content type', async () => {
    await invokeTestCli(['upload', 'test/testpage/swarm.bzz', '--curl', ...getStampOption()])
    expect(consoleMessages).toMatchLinesInOrder([['-H "content-type: application/octet-stream"']])
  })
})
