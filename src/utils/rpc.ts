import { Contract, JsonRpcProvider, TransactionReceipt, TransactionResponse, Wallet } from 'ethers'
import { ABI, Contracts, getNetworkId } from './contracts'

export async function eth_getBalance(address: string, provider: JsonRpcProvider): Promise<string> {
  if (!address.startsWith('0x')) {
    address = `0x${address}`
  }
  const balance = await provider.getBalance(address)

  return balance.toString()
}

export async function eth_getBalanceERC20(
  address: string,
  provider: JsonRpcProvider,
  tokenAddress = Contracts.bzz,
): Promise<string> {
  if (!address.startsWith('0x')) {
    address = `0x${address}`
  }
  const contract = new Contract(tokenAddress, ABI.bzz, provider)
  const balance = await contract.balanceOf!(address)

  return balance.toString()
}

interface TransferResponse {
  transaction: TransactionResponse
  receipt: TransactionReceipt
}

interface TransferCost {
  gasPrice: bigint
  totalCost: bigint
}

export async function estimateNativeTransferTransactionCost(
  privateKey: string,
  jsonRpcProvider: string,
): Promise<TransferCost> {
  const { provider } = await makeReadySigner(privateKey, jsonRpcProvider)
  const gasLimit = 21000n
  const { gasPrice } = await provider.getFeeData()

  if (gasPrice === null) {
    throw new Error('Unable to determine gas price from provider')
  }

  return { gasPrice, totalCost: gasPrice * gasLimit }
}

export async function sendNativeTransaction(
  privateKey: string,
  to: string,
  value: string,
  jsonRpcProvider: string,
  externalGasPrice?: bigint,
): Promise<TransferResponse> {
  if (!to.startsWith('0x')) {
    to = `0x${to}`
  }
  const { signer, provider } = await makeReadySigner(privateKey, jsonRpcProvider)
  const resolvedGasPrice = externalGasPrice ?? (await provider.getFeeData()).gasPrice

  if (resolvedGasPrice === null || resolvedGasPrice === undefined) {
    throw new Error('Unable to determine gas price from provider')
  }

  const transaction = await signer.sendTransaction({
    to,
    value: BigInt(value),
    gasPrice: resolvedGasPrice,
    gasLimit: 21000n,
    type: 0,
  })
  const receipt = await transaction.wait(1)

  if (receipt === null) {
    throw new Error('Transaction was not included in a block')
  }

  return { transaction, receipt }
}

export async function sendBzzTransaction(
  privateKey: string,
  to: string,
  value: string,
  jsonRpcProvider: string,
): Promise<TransferResponse> {
  if (!to.startsWith('0x')) {
    to = `0x${to}`
  }
  const { signer, provider } = await makeReadySigner(privateKey, jsonRpcProvider)
  const { gasPrice } = await provider.getFeeData()

  if (gasPrice === null) {
    throw new Error('Unable to determine gas price from provider')
  }

  const bzz = new Contract(Contracts.bzz, ABI.bzz, signer)
  const transaction = await bzz.transfer!(to, value, { gasPrice })
  const receipt = await transaction.wait(1)

  if (receipt === null) {
    throw new Error('Transaction was not included in a block')
  }

  return { transaction, receipt }
}

export async function makeReadySigner(privateKey: string, jsonRpcProvider: string) {
  const provider = new JsonRpcProvider(jsonRpcProvider, getNetworkId())
  await provider.getNetwork()
  const signer = new Wallet(privateKey, provider)

  return { signer, provider }
}
