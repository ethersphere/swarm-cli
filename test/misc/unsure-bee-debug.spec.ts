import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describeCommand('Test unsure bee-debug', ({ hasMessageContaining }) => {
  it('should work for upload (optional)', async () => {
    delete process.env.BEE_API_URL
    delete process.env.BEE_DEBUG_API_URL
    await invokeTestCli(['upload', 'README.md', '--bee-api-url', 'http://localhost:1633', ...getStampOption()])
    expect(hasMessageContaining('Swarm hash')).toBeTruthy()
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
    expect(hasMessageContaining('Could not reach Debug API')).toBeFalsy()
  })
})
