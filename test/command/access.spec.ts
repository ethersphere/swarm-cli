import { System } from 'cafe-utility'
import { existsSync, unlinkSync } from 'fs'
import { describeCommand, invokeTestCli } from '../utility'
import { getPublicAddress } from '../utility/address'
import { getStampOption } from '../utility/stamp'

describeCommand(
  'Test Access command',
  ({ consoleMessages, getNthLastMessage, getLastMessage }) => {
    afterEach(() => {
      const historyFilePath = `${__dirname}/../testconfig/access-access-history.json`

      if (existsSync(historyFilePath)) {
        unlinkSync(historyFilePath)
      }
    })
    describe('init', () => {
      it('should initialize access with pss address as grantee', async () => {
        const pubKey = await getPublicAddress('http://localhost:21633')
        await invokeTestCli(['access', 'init', ...getStampOption(), '--list-name', 'test-access', '--grantee', pubKey])
        expect(getLastMessage()).toEqual("Grantee list 'test-access' initialized successfully!")
      })

      describe('when grantee list with the same name already exists', () => {
        it('should show error message', async () => {
          await invokeTestCli(['access', 'init', ...getStampOption(), '-n', 'test-access'])
          await invokeTestCli(['access', 'init', ...getStampOption(), '-n', 'test-access'])
          expect(consoleMessages[1]).toEqual("Grantee list with name 'test-access' has already been initialized!")
          expect(consoleMessages[2]).toContain('process.exit() was called with code 1')
        })
      })

      describe('when verbose option is used', () => {
        it('should show grantee list reference and history address', async () => {
          await invokeTestCli(['access', 'init', ...getStampOption(), '-n', 'test-access', '--verbose'])
          expect(getNthLastMessage(2)).toContain('Grantee list reference')
          expect(getNthLastMessage(2)).toMatch(/[a-f0-9]{64}/g)
          expect(getLastMessage()).toContain('History address')
          expect(getLastMessage()).toMatch(/[a-f0-9]{64}/g)
        })
      })
    })

    describe('grant', () => {
      it('should grant access to a new grantee', async () => {
        await invokeTestCli(['access', 'init', ...getStampOption(), '-n', 'test-access'])
        await System.sleepMillis(1000)
        const pubKey = await getPublicAddress('http://localhost:21633')
        await invokeTestCli(['access', 'grant', '--list-name', 'test-access', '--grantee', pubKey])
        expect(getLastMessage()).toContain(`Access granted to ${pubKey}`)
      })

      describe('when grantee list does not exist', () => {
        it('should show error message', async () => {
          await invokeTestCli(['access', 'grant', '-n', 'nonexistent-list', '-g', '0x123'])
          expect(consoleMessages[0]).toContain("Grantee list with name 'nonexistent-list' does not exist!")
          expect(consoleMessages[1]).toContain('process.exit() was called with code 1')
        })
      })

      describe('when no grantees are specified', () => {
        it('should show error message', async () => {
          await invokeTestCli(['access', 'init', ...getStampOption(), '-n', 'test-access'])
          await System.sleepMillis(1000)
          await invokeTestCli(['access', 'grant', '--list-name', 'test-access'])
          expect(consoleMessages[1]).toContain('At least one grantee must be specified!')
          expect(consoleMessages[2]).toContain('process.exit() was called with code 1')
        })
      })

      describe('when verbose option is used', () => {
        it('should show grantee list reference and history address', async () => {
          await invokeTestCli(['access', 'init', ...getStampOption(), '-n', 'test-access'])
          await System.sleepMillis(1000)
          const pubKey = await getPublicAddress('http://localhost:21633')
          await invokeTestCli(['access', 'grant', '--list-name', 'test-access', '--grantee', pubKey, '--verbose'])
          expect(getNthLastMessage(2)).toContain('Grantee list reference')
          expect(getNthLastMessage(2)).toMatch(/[a-f0-9]{64}/g)
          expect(getLastMessage()).toContain('History address')
          expect(getLastMessage()).toMatch(/[a-f0-9]{64}/g)
        })
      })
    })

    describe('revoke', () => {
      it('should revoke access from a grantee', async () => {
        const pubKey = await getPublicAddress('http://localhost:21633')
        await invokeTestCli(['access', 'init', ...getStampOption(), '-n', 'test-access', '--grantee', pubKey])
        await System.sleepMillis(1000)
        await invokeTestCli(['access', 'revoke', '--list-name', 'test-access', '--grantee', pubKey])
        expect(getLastMessage()).toContain(`Access revoked from ${pubKey}`)
      })

      describe('when grantee list does not exist', () => {
        it('should show error message', async () => {
          await invokeTestCli(['access', 'revoke', '-n', 'nonexistent-list', '-g', '0x123'])
          expect(consoleMessages[0]).toContain("Grantee list with name 'nonexistent-list' does not exist!")
          expect(consoleMessages[1]).toContain('process.exit() was called with code 1')
        })
      })

      describe('when no grantees are specified', () => {
        it('should show error message', async () => {
          await invokeTestCli(['access', 'init', ...getStampOption(), '-n', 'test-access'])
          await System.sleepMillis(1000)
          await invokeTestCli(['access', 'revoke', '--list-name', 'test-access'])
          expect(consoleMessages[1]).toContain('At least one grantee must be specified!')
          expect(consoleMessages[2]).toContain('process.exit() was called with code 1')
        })
      })

      describe('when verbose option is used', () => {
        it('should show grantee list reference and history address', async () => {
          const pubKey = await getPublicAddress('http://localhost:21633')
          await invokeTestCli(['access', 'init', ...getStampOption(), '-n', 'test-access', '--grantee', pubKey])
          await System.sleepMillis(1000)
          await invokeTestCli(['access', 'revoke', '--list-name', 'test-access', '--grantee', pubKey, '--verbose'])
          expect(getNthLastMessage(2)).toContain('Grantee list reference')
          expect(getNthLastMessage(2)).toMatch(/[a-f0-9]{64}/g)
          expect(getLastMessage()).toContain('History address')
          expect(getLastMessage()).toMatch(/[a-f0-9]{64}/g)
        })
      })
    })

    describe('list', () => {
      it('should list all grantees in the list', async () => {
        const granteePubKey = await getPublicAddress('http://localhost:21633')
        await invokeTestCli(['access', 'init', ...getStampOption(), '-n', 'test-access'])
        await System.sleepMillis(1000)
        await invokeTestCli(['access', 'grant', '--list-name', 'test-access', '--grantee', granteePubKey])
        await System.sleepMillis(1000)
        await invokeTestCli(['access', 'list', '--list-name', 'test-access'])
        expect(getNthLastMessage(2)).toContain(`Grantees of list 'test-access':`)
        expect(getLastMessage()).toContain(granteePubKey)

        await invokeTestCli(['access', 'revoke', '--list-name', 'test-access', '--grantee', granteePubKey])
        await System.sleepMillis(1000)
        await invokeTestCli(['access', 'list', '--list-name', 'test-access'])
        expect(getLastMessage()).toContain("Grantee list 'test-access' has no grantees.")
      })

      describe('when grantee list does not exist', () => {
        it('should show error message', async () => {
          await invokeTestCli(['access', 'list', '-n', 'nonexistent-list'])
          expect(consoleMessages[0]).toContain("Grantee list with name 'nonexistent-list' does not exist!")
          expect(consoleMessages[1]).toContain('process.exit() was called with code 1')
        })
      })
    })

    describe('history', () => {
      it('should show the history of operations on a grantee list', async () => {
        const granteePubKey = await getPublicAddress('http://localhost:21633')
        await invokeTestCli(['access', 'init', ...getStampOption(), '-n', 'test-access', '--grantee', granteePubKey])
        await System.sleepMillis(1000)
        await invokeTestCli(['access', 'revoke', '--list-name', 'test-access', '--grantee', granteePubKey])
        await System.sleepMillis(1000)
        await invokeTestCli(['access', 'history', '--list-name', 'test-access'])
        process.stderr.write(consoleMessages.join('\n'))
        expect(getNthLastMessage(10)).toContain('Latest history address')
        expect(getNthLastMessage(9)).toContain('Latest grantee list reference')
        expect(getNthLastMessage(7)).toContain('revoke')
        expect(getNthLastMessage(5)).toContain('Grantees:')
        expect(getNthLastMessage(5)).toContain(granteePubKey)
        expect(getNthLastMessage(3)).toContain('init')
      })

      describe('when grantee list does not exist', () => {
        it('should show error message', async () => {
          await invokeTestCli(['access', 'history', '-n', 'nonexistent-list'])
          expect(consoleMessages[0]).toContain("Grantee list with name 'nonexistent-list' does not exist!")
          expect(consoleMessages[1]).toContain('process.exit() was called with code 1')
        })
      })
    })
  },
  { configFileName: 'access' },
)
