import { PublicKey } from '@ethersphere/bee-js'
import { invokeTestCli } from '.'
import { Addresses } from '../../src/command/addresses'

export async function getPssAddress(beeApiUrl: string): Promise<PublicKey> {
  const execution = await invokeTestCli(['addresses', '--bee-api-url', beeApiUrl])

  return (execution.runnable as Addresses).nodeAddresses.pssPublicKey
}

export function getWorkerPssAddress(stringLength: number): string {
  if (!process.env.WORKER_PSS_ADDRESS) {
    throw Error('Worker PSS address is not set.')
  }

  return process.env.WORKER_PSS_ADDRESS.slice(0, stringLength)
}
