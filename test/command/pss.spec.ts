import { Receive } from '../../src/command/pss/receive'
import { sleep } from '../../src/utils'
import { invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

describe('Test PSS command', () => {
  it('should receive sent pss message', async () => {
    const invocation = invokeTestCli([
      'pss',
      'receive',
      '--bee-api-url',
      'http://localhost:11633',
      '--timeout',
      '10000',
    ])
    await sleep(1000)
    await invokeTestCli(['pss', 'send', '--address-prefix', '00', '--data', 'Bzzz Bzzzz Bzzzz', ...getStampOption()])
    const receive: Receive = (await invocation).runnable as Receive
    expect(receive.receivedMessage).toBe('Bzzz Bzzzz Bzzzz')
  })
})
