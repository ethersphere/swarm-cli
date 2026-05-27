import { unlinkSync } from 'fs'
import { describeCommand, invokeTestCli } from '../utility'
import { getPssAddress } from '../utility/address'
import { getStampOption } from '../utility/stamp'

describeCommand(
  'Test Access command',
  ({ consoleMessages, getLastMessage }) => {
    afterEach(() => {
      unlinkSync(`${__dirname}/../testconfig/access-access-history.json`)
    })
    describe('init', () => {
      it('should initialize access with pss address as grantee', async () => {
        const pssAddress = await getPssAddress('http://localhost:21633')
        await invokeTestCli([
          'access',
          'init',
          ...getStampOption(),
          '--list-name',
          'test-access',
          '--grantee',
          pssAddress.toHex(),
        ])
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
    })
  },
  { configFileName: 'access' },
)
