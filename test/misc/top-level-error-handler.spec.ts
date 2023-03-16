import { Utils } from 'furious-commander'
import { FORMATTED_ERROR } from '../../src/command/root-command/printer'
import { describeCommand, invokeTestCli } from '../utility'

function expectErrorsToDeepEqual(actual: string[], expected: string[]): void {
  expect(actual).toStrictEqual(expected)
}

describeCommand('Top-Level Error Handler', ({ consoleMessages }) => {
  it('should handle normal errors', async () => {
    jest.spyOn(Utils, 'getSourcemap').mockImplementation(() => {
      throw Error('Oops!')
    })
    await invokeTestCli(['status'])
    expectErrorsToDeepEqual(consoleMessages, [
      FORMATTED_ERROR + ' Oops!',
      '',
      'There may be additional information in the Bee logs.',
    ])
  })

  it('should handle string errors', async () => {
    jest.spyOn(Utils, 'getSourcemap').mockImplementation(() => {
      throw 'Oops!'
    })
    await invokeTestCli(['status'])
    expectErrorsToDeepEqual(consoleMessages, [
      FORMATTED_ERROR + ' Oops!',
      '',
      'There may be additional information in the Bee logs.',
    ])
  })

  it('should handle empty errors', async () => {
    jest.spyOn(Utils, 'getSourcemap').mockImplementation(() => {
      throw Error()
    })
    await invokeTestCli(['status'])
    expectErrorsToDeepEqual(consoleMessages, [
      FORMATTED_ERROR + ' The command failed, but there is no error message available.',
      '',
      'Check your Bee log to learn if your request reached the node.',
    ])
  })

  it('should handle undefined errors', async () => {
    jest.spyOn(Utils, 'getSourcemap').mockImplementation(() => {
      throw Error(undefined as unknown as string)
    })
    await invokeTestCli(['status'])
    expectErrorsToDeepEqual(consoleMessages, [
      FORMATTED_ERROR + ' The command failed, but there is no error message available.',
      '',
      'Check your Bee log to learn if your request reached the node.',
    ])
  })

  it('should handle 500 errors with custom message', async () => {
    jest.spyOn(Utils, 'getSourcemap').mockImplementation(() => {
      throw Error('This should be printed')
    })
    await invokeTestCli(['status'])
    expectErrorsToDeepEqual(consoleMessages, [
      FORMATTED_ERROR + ' This should be printed',
      '',
      'There may be additional information in the Bee logs.',
    ])
  })

  it('should handle 500 errors with default message', async () => {
    jest.spyOn(Utils, 'getSourcemap').mockImplementation(() => {
      throw Error('Internal Server Error')
    })
    await invokeTestCli(['status'])
    expectErrorsToDeepEqual(consoleMessages, [
      FORMATTED_ERROR + ' Internal Server Error',
      '',
      'There may be additional information in the Bee logs.',
    ])
  })

  it('should handle 404 errors with custom message', async () => {
    jest.spyOn(Utils, 'getSourcemap').mockImplementation(() => {
      throw Error('This should be printed')
    })
    await invokeTestCli(['status'])
    expectErrorsToDeepEqual(consoleMessages, [
      FORMATTED_ERROR + ' This should be printed',
      '',
      'There may be additional information in the Bee logs.',
    ])
  })

  it('should handle 404 errors with default message', async () => {
    jest.spyOn(Utils, 'getSourcemap').mockImplementation(() => {
      throw Error('Not found')
    })
    await invokeTestCli(['status'])
    expectErrorsToDeepEqual(consoleMessages, [
      FORMATTED_ERROR + ' Not found',
      '',
      'There may be additional information in the Bee logs.',
    ])
  })
})
