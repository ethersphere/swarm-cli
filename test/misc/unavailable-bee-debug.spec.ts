import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describeCommand('Test unavailable bee-debug', ({ consoleMessages, hasMessageContaining }) => {
  it('should fail for stamp commands (mandatory)', async () => {
    await invokeTestCli(['stamp', 'list', '--bee-debug-api-url', 'http://localhost:3362'])
    expect(consoleMessages[0]).toContain('Could not reach Debug API at http://localhost:3362')
    expect(consoleMessages[1]).toContain('Make sure you have the Debug API enabled in your Bee config')
    expect(consoleMessages[2]).toContain('or correct the URL with the --bee-debug-api-url option.')
  })

  it('should work for upload (optional)', async () => {
    await invokeTestCli(['upload', 'README.md', '--bee-debug-api-url', 'http://localhost:3362', ...getStampOption()])
    expect(hasMessageContaining('Swarm hash')).toBeTruthy()
    expect(hasMessageContaining('Could not reach Debug API')).toBeFalsy()
  })

  it('should work for feed upload (optional)', async () => {
    const identityName = 'i' + Date.now()
    await invokeTestCli(['identity', 'create', identityName, '--only-keypair'])
    await invokeTestCli([
      'feed',
      'upload',
      'README.md',
      '--bee-debug-api-url',
      'http://localhost:3362',
      '--identity',
      identityName,
      ...getStampOption(),
    ])
    expect(hasMessageContaining('Swarm hash')).toBeTruthy()
    expect(hasMessageContaining('Could not reach Debug API')).toBeFalsy()
  })
})
