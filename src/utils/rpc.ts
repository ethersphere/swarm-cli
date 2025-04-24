import { BigNumber as BN, Contract, providers, Wallet } from 'ethers'
import { ABI, Contracts } from './contracts'

const NETWORK_ID = 100

export async function eth_getBalance(address: string, provider: providers.JsonRpcProvider): Promise<string> {
  if (!address.startsWith('0x')) {
    address = `0x${address}`
  }
  const balance = await provider.getBalance(address)

  return balance.toString()
}

export async function eth_getBalanceERC20(
  address: string,
  provider: providers.JsonRpcProvider,
  tokenAddress = Contracts.bzz,
): Promise<string> {
  if (!address.startsWith('0x')) {
    address = `0x${address}`
  }
  const contract = new Contract(tokenAddress, ABI.bzz, provider)
  const balance = await contract.balanceOf(address)

  return balance.toString()
}

interface TransferResponse {
  transaction: providers.TransactionResponse
  receipt: providers.TransactionReceipt
}

interface TransferCost {
  gasPrice: BN
  totalCost: BN
}

export async function estimateNativeTransferTransactionCost(
  privateKey: string,
  jsonRpcProvider: string,
): Promise<TransferCost> {
  const signer = await makeReadySigner(privateKey, jsonRpcProvider)
  const gasLimit = '21000'
  const gasPrice = await signer.getGasPrice()

  return { gasPrice, totalCost: gasPrice.mul(gasLimit) }
}

export async function sendNativeTransaction(
  privateKey: string,
  to: string,
  value: string,
  jsonRpcProvider: string,
  externalGasPrice?: BN,
): Promise<TransferResponse> {
  const signer = await makeReadySigner(privateKey, jsonRpcProvider)
  const gasPrice = externalGasPrice ?? (await signer.getGasPrice())
  const transaction = await signer.sendTransaction({
    to,
    value: BN.from(value),
    gasPrice,
    gasLimit: BN.from(21000),
    type: 0,
  })
  const receipt = await transaction.wait(1)

  return { transaction, receipt }
}

export async function sendBzzTransaction(
  privateKey: string,
  to: string,
  value: string,
  jsonRpcProvider: string,
): Promise<TransferResponse> {
  const signer = await makeReadySigner(privateKey, jsonRpcProvider)
  const gasPrice = await signer.getGasPrice()
  const bzz = new Contract(Contracts.bzz, ABI.bzz, signer)
  const transaction = await bzz.transfer(to, value, { gasPrice })
  const receipt = await transaction.wait(1)

  return { transaction, receipt }
}

export async function makeReadySigner(privateKey: string, jsonRpcProvider: string) {
  const provider = new providers.JsonRpcProvider(jsonRpcProvider, NETWORK_ID)
  await provider.ready
  const signer = new Wallet(privateKey, provider)

  return signer
}
