import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describeCommand('Test unsure bee-debug', ({ consoleMessages, hasMessageContaining }) => {
  it('should fail for balance commands (mandatory)', async () => {
    delete process.env.BEE_API_URL
    delete process.env.BEE_DEBUG_API_URL
    await invokeTestCli(['balance', '--bee-api-url', 'http://localhost:1633'])
    expect(consoleMessages[1]).toContain('Cannot ensure Debug API correctness!')
    expect(consoleMessages[2]).toContain('--bee-api-url is set explicitly, but --bee-debug-api-url is left default.')
    expect(consoleMessages[3]).toContain('This may be incorrect and cause unexpected behaviour.')
    expect(consoleMessages[4]).toContain(
      'Please run the command again and specify explicitly the --bee-debug-api-url value.',
    )
  })

  it('should fail for stamp commands (mandatory)', async () => {
    delete process.env.BEE_API_URL
    delete process.env.BEE_DEBUG_API_URL
    await invokeTestCli(['stamp', 'list', '--bee-api-url', 'http://localhost:1633'])
    expect(consoleMessages[0]).toContain('Cannot ensure Debug API correctness!')
    expect(consoleMessages[1]).toContain('--bee-api-url is set explicitly, but --bee-debug-api-url is left default.')
    expect(consoleMessages[2]).toContain('This may be incorrect and cause unexpected behaviour.')
    expect(consoleMessages[3]).toContain(
      'Please run the command again and specify explicitly the --bee-debug-api-url value.',
    )
  })

  it('should work for upload (optional)', async () => {
    delete process.env.BEE_API_URL
    delete process.env.BEE_DEBUG_API_URL
    await invokeTestCli(['upload', 'README.md', '--bee-api-url', 'http://localhost:1633', ...getStampOption()])
    expect(hasMessageContaining('Swarm hash')).toBeTruthy()
    expect(hasMessageContaining('Cannot ensure Debug API correctness')).toBeFalsy()
    expect(hasMessageContaining('Could not reach Debug API')).toBeFalsy()
  })

  it('should work for feed upload (optional)', async () => {
    delete process.env.BEE_API_URL
    delete process.env.BEE_DEBUG_API_URL
    const identityName = 'i' + Date.now()
    await invokeTestCli(['identity', 'create', identityName, '--only-keypair'])
    await invokeTestCli([
      'feed',
      'upload',
      'README.md',
      '--bee-api-url',
      'http://localhost:1633',
      '--identity',
      identityName,
      ...getStampOption(),
    ])
    expect(hasMessageContaining('Swarm hash')).toBeTruthy()
    expect(hasMessageContaining('Cannot ensure Debug API correctness')).toBeFalsy()
    expect(hasMessageContaining('Could not reach Debug API')).toBeFalsy()
  })
})
