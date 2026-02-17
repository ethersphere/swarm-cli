import { Utils } from '@ethersphere/bee-js'
import { BigNumber, Contract, providers, Wallet, utils as ethersUtils } from 'ethers'
import { NETWORK_ID, Contracts, ABI } from './contracts'
import { eth_getBalance, makeReadySigner } from './rpc'
import { CommandLog } from '../command/root-command/command-log'

/**
 * Checks if a wallet has sufficient BZZ funds for an operation
 * @param walletAddress The wallet address to check
 * @param requiredAmount The required amount in BZZ
 * @param availableAmount The available amount in BZZ
 * @param console Console instance for output
 * @returns True if sufficient funds, false otherwise
 */
export async function checkBzzBalance(
  walletAddress: string,
  requiredAmount: bigint,
  availableAmount: bigint,
  console: CommandLog,
): Promise<boolean> {
  // Convert to string for comparison
  const requiredAmountStr = requiredAmount.toString()
  const availableAmountStr = availableAmount.toString()
  
  if (BigNumber.from(availableAmountStr).lt(BigNumber.from(requiredAmountStr))) {
    console.error(`\nWallet address: 0x${walletAddress} has insufficient BZZ funds.`)
    // Format amounts for display
    const requiredFormatted = ethersUtils.formatUnits(requiredAmount, 18)
    const availableFormatted = ethersUtils.formatUnits(availableAmount, 18)
    
    console.error(`Required:  ${requiredFormatted} BZZ`)
    console.error(`Available: ${availableFormatted} BZZ`)
    return false
  }
  return true
}

/**
 * Checks if a wallet has sufficient xDAI funds for gas
 * @param walletAddress The wallet address to check
 * @param estimatedGasCost The estimated gas cost
 * @param console Console instance for output
 * @returns True if sufficient funds, false otherwise
 */
export async function checkXdaiBalance(
  walletAddress: string,
  estimatedGasCost: BigNumber,
  console: CommandLog,
): Promise<boolean> {
  const jsonRpcUrl = 'https://xdai.fairdatasociety.org'
  const provider = new providers.JsonRpcProvider(jsonRpcUrl, NETWORK_ID)
  const xDAI = await eth_getBalance(walletAddress, provider)
  const xDAIValue = BigNumber.from(xDAI)

  if (xDAIValue.lt(estimatedGasCost)) {
    console.error(`\nWallet address: 0x${walletAddress} has insufficient xDAI funds for gas fees.`)
    console.error(
      `Required: ~${ethersUtils.formatEther(estimatedGasCost)} xDAI, Available: ${ethersUtils.formatEther(
        xDAIValue
      )} xDAI`,
    )
    return false
  }
  return true
}

/**
 * Calculates and displays operation costs
 * @param depth The depth of the batch
 * @param amount The amount in PLUR
 * @param bzzBalance The current BZZ balance (optional)
 * @param console Console instance for output
 * @returns An object containing cost information
 */
export async function calculateAndDisplayCosts(
  depth: number,
  amount: bigint,
  bzzBalance: bigint,
  console: CommandLog,
): Promise<{
  bzzCost: any  // Keep as 'any' since it's a Utils.getStampCost return type
  estimatedGasCost: BigNumber
  provider: providers.JsonRpcProvider
}> {
  const bzzCost = Utils.getStampCost(depth, amount)
  const jsonRpcUrl = 'https://xdai.fairdatasociety.org'
  const provider = new providers.JsonRpcProvider(jsonRpcUrl, NETWORK_ID)
  // Estimate gas costs
  const gasPrice = await provider.getGasPrice()
  const gasLimit = BigNumber.from(1000000) // Conservative estimate
  const estimatedGasCost = gasPrice.mul(gasLimit)
  
  console.log(`Operation will cost ${bzzCost.toDecimalString()} BZZ and ~${ethersUtils.formatEther(estimatedGasCost)} xDAI`)
  console.log(`Your current balance is ${ethersUtils.formatUnits(bzzBalance, 16)} BZZ`)
  
  return { bzzCost, estimatedGasCost, provider }
}

/**
 * Checks if the current allowance is sufficient and approves if needed
 * @param privateKey The private key of the wallet
 * @param requiredAmount The required amount in BZZ (as a string)
 * @param console Console instance for output
 * @returns True if approval was successful or not needed
 */
export async function checkAndApproveAllowance(
  privateKey: string,
  requiredAmount: string,
  console: CommandLog,
): Promise<boolean> {
  const jsonRpcUrl = 'https://xdai.fairdatasociety.org'
  const wallet = new Wallet(privateKey)
  const signer = await makeReadySigner(wallet.privateKey, jsonRpcUrl)
  
  // Check current allowance
  const allowanceAbi = [
    {
      type: 'function',
      stateMutability: 'view',
      payable: false,
      outputs: [{ type: 'uint256', name: 'remaining' }],
      name: 'allowance',
      inputs: [
        { type: 'address', name: '_owner' },
        { type: 'address', name: '_spender' },
      ],
      constant: true,
    },
  ]
  
  const bzzAllowanceContract = new Contract(Contracts.bzz, allowanceAbi, signer)
  const currentAllowance = await bzzAllowanceContract.allowance(wallet.address, Contracts.postageStamp)
  console.log(`Current allowance: ${Number(currentAllowance) / 10 ** 18} BZZ`)
  
  if (currentAllowance.lt(requiredAmount)) {
    console.log(`Approving spending of ${requiredAmount} PLUR to ${Contracts.postageStamp}`)
    const tokenProxyContract = new Contract(Contracts.bzz, ABI.tokenProxy, signer)
    const approve = await tokenProxyContract.approve(Contracts.postageStamp, requiredAmount, {
      gasLimit: 130_000,
      type: 2,
      maxFeePerGas: BigNumber.from(2000000000), // 2 gwei
      maxPriorityFeePerGas: BigNumber.from(1000000000), // 1 gwei
    })
    console.log(`Waiting 3 blocks on approval tx ${approve.hash}`)
    await approve.wait(3)
    return true
  } else {
    console.log(`Approval not needed. Current allowance: ${Number(currentAllowance) / 10 ** 18} BZZ`)
    return true
  }
}
