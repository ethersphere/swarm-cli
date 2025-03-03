import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'

const stripAnsi = (str: string) =>
  str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')

describeCommand('Test Grantee command', ({ consoleMessages }) => {
  let reference = ''
  let history = ''
  it('should create', async () => {
    await invokeTestCli(['grantee', 'create', 'test/grantees.json', ...getStampOption()])

    const [refMsg, histMsg] = consoleMessages.map(stripAnsi)

    const referenceMatch = refMsg.match(/Grantee reference: (\w{128})/)
    expect(referenceMatch).not.toBeNull()

    if (referenceMatch) {
      reference = referenceMatch[1]
    }

    const historyMatch = histMsg.match(/Grantee history reference: (\w{64})/)
    expect(historyMatch).not.toBeNull()

    if (historyMatch) {
      history = historyMatch[1]
    }
  })
})
