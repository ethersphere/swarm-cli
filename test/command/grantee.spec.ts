import { describeCommand, invokeTestCli } from '../utility'
import { getStampOption } from '../utility/stamp'
import * as fs from 'fs'
import * as path from 'path'
import { stripAnsi } from '../utility'

function extractReferences(consoleMessages: string[]): [string, string] {
  const nonAnsiConsoleMessages = consoleMessages.map(stripAnsi)
  const referenceMatch = nonAnsiConsoleMessages[0].match(/Grantee reference: (\w{128})/)
  const historyMatch = nonAnsiConsoleMessages[1].match(/Grantee history reference: (\w{64})/)

  return [referenceMatch ? referenceMatch[1] : '', historyMatch ? historyMatch[1] : '']
}

function extractPublicKeys(consoleMessages: string[]): string[] {
  const publicKeysStringPrefix = 'Grantee public keys: '
  const publicKeysString = consoleMessages.map(stripAnsi).find(msg => msg.startsWith(publicKeysStringPrefix))

  return publicKeysString ? publicKeysString.replace(publicKeysStringPrefix, '').split('\n') : []
}

describeCommand('Test Grantee command', ({ consoleMessages }) => {
  let grantees = { grantees: [] }
  beforeAll(() => {
    grantees = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../test/grantees.json'), 'utf-8'))
  })

  beforeEach(() => {
    consoleMessages.length = 0
  })

  it('should create', async () => {
    await invokeTestCli(['grantee', 'create', 'test/grantees.json', ...getStampOption()])
    const [reference, history] = extractReferences(consoleMessages)
    expect(reference).not.toBeNull()
    expect(history).not.toBeNull()
  })

  it('should get', async () => {
    await invokeTestCli(['grantee', 'create', 'test/grantees.json', ...getStampOption()])
    const [reference] = extractReferences(consoleMessages)
    consoleMessages.length = 0

    await invokeTestCli(['grantee', 'get', reference])
    const publicKeys = extractPublicKeys(consoleMessages)

    expect(publicKeys.length).toBe(grantees.grantees.length)

    publicKeys.forEach((key, index) => {
      expect(key).toBe(grantees.grantees[index])
    })
  })

  it('should patch', async () => {
    await invokeTestCli(['grantee', 'create', 'test/grantees.json', ...getStampOption()])
    const [reference, history] = extractReferences(consoleMessages)
    consoleMessages.length = 0

    await new Promise(resolve => setTimeout(resolve, 1000))
    await invokeTestCli([
      'grantee',
      'patch',
      'test/grantees-patch.json',
      '--reference',
      reference,
      '--history',
      history,
      ...getStampOption(),
    ])
    await new Promise(resolve => setTimeout(resolve, 1000))
    const [referenceAfterPatch, historyAfterPatch] = extractReferences(consoleMessages)

    expect(referenceAfterPatch).not.toBeNull()
    expect(historyAfterPatch).not.toBeNull()
    consoleMessages.length = 0

    await new Promise(resolve => setTimeout(resolve, 1000))
    await invokeTestCli(['grantee', 'get', referenceAfterPatch])
    const publicKeys = extractPublicKeys(consoleMessages)
    // Original count: 3. Added one, revoked (deleted) two, remaining two grantees.
    expect(publicKeys.length).toBe(2)
  })
})
