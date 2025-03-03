import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'
import * as fs from 'fs'
import * as path from 'path'

const grantees = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../test/grantees.json'), 'utf-8'))

const stripAnsi = (str: string) =>
  str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')

describeCommand('Test Grantee command', ({ consoleMessages }) => {
  let reference = ''
  let history = ''

  const parseConsoleMessages = () => {
    const nonAnsiConsoleMessages = consoleMessages.map(stripAnsi)
    const referenceMatch = nonAnsiConsoleMessages[0].match(/Grantee reference: (\w{128})/)

    if (referenceMatch) {
      reference = referenceMatch[1]
    }

    const historyMatch = nonAnsiConsoleMessages[1].match(/Grantee history reference: (\w{64})/)

    if (historyMatch) {
      history = historyMatch[1]
    }
  }

  beforeEach(async () => {
    consoleMessages.length = 0
    await invokeTestCli(['grantee', 'create', 'test/grantees.json', ...getStampOption()])
    parseConsoleMessages()
  })

  it('should create', () => {
    expect(reference).not.toBeNull()
    expect(history).not.toBeNull()
  })

  it('should get', async () => {
    await invokeTestCli(['grantee', 'get', reference])
    const nonAnsiConsoleMessages = consoleMessages.map(stripAnsi)

    const publicKeysString = nonAnsiConsoleMessages.find(msg => msg.startsWith('Grantee public keys: '))
    const publicKeys = publicKeysString ? publicKeysString.replace('Grantee public keys: ', '').split('\n') : []

    expect(publicKeys.length).toBe(grantees.grantees.length)

    publicKeys.forEach((key, index) => {
      expect(key).toBe(grantees.grantees[index])
    })
  })
})
