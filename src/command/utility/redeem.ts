import { Dates, System } from 'cafe-utility'
import { BigNumber, providers, Wallet } from 'ethers'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { NETWORK_ID } from '../../utils/bzz-abi'
import { estimateNativeTransferTransactionCost, Rpc } from '../../utils/rpc'
import { RootCommand } from '../root-command'

export class Redeem extends RootCommand implements LeafCommand {
  public readonly name = 'redeem'

  public readonly description = 'Transfer xBZZ and xDAI from a private key to the Bee wallet'

  @Argument({
    key: 'wallet',
    type: 'hex-string',
    description: 'Redeemable wallet address (private key)',
    required: true,
  })
  public wallet!: string

  @Option({
    key: 'json-rpc-url',
    type: 'string',
    description: 'Ethereum JSON-RPC URL',
    default: 'https://xdai.fairdatasociety.org',
  })
  public jsonRpcUrl!: string

  @Option({
    key: 'target',
    type: 'hex-string',
    description: 'Target wallet address',
    defaultDescription: 'Bee wallet address',
  })
  public target!: string

  public async run(): Promise<void> {
    super.init()
    if (!this.target) {
      this.console.log('Fetching Bee wallet address...')
      const { ethereum } = await this.bee.getNodeAddresses()
      this.target = ethereum
    }

    this.console.log(`Target wallet address: ${this.target}`)
    const provider = new providers.JsonRpcProvider(this.jsonRpcUrl, NETWORK_ID)
    this.console.log('Creating wallet...')
    const wallet = new Wallet(this.wallet, provider)
    this.console.log('Fetching xBZZ balance...')
    const xBZZ = await Rpc._eth_getBalanceERC20(wallet.address, provider)
    this.console.log(`xBZZ balance: ${xBZZ}`)
    this.console.log('Fetching xDAI balance...')
    let xDAI = await Rpc.eth_getBalance(wallet.address, provider)
    this.console.log(`xDAI balance: ${xDAI}`)

    if (!this.quiet && !this.yes) {
      this.yes = await this.console.confirm('Do you want to continue?')
    }

    if (!this.yes && !this.quiet) {
      return
    }

    const firstKnownxDAI = xDAI
    if (xBZZ !== '0') {
      this.console.log('Transferring xBZZ to Bee wallet...')
      await Rpc.sendBzzTransaction(this.wallet, this.target, xBZZ, this.jsonRpcUrl)

      for (let i = 0; i < 10; i++) {
        this.console.log(`Refreshing xDAI balance #${i + 1}...`)
        xDAI = await Rpc.eth_getBalance(wallet.address, provider)

        if (xDAI !== firstKnownxDAI) {
          this.console.log(`xDAI balance: ${xDAI}`)
          break
        }
        await System.sleepMillis(Dates.seconds(3))
      }

      if (xDAI === firstKnownxDAI) {
        this.console.log('xDAI balance did not change, skipping transfer')
        return
      }
    }
    const { gasPrice, totalCost } = await estimateNativeTransferTransactionCost(this.wallet, this.jsonRpcUrl)
    const xDAIValue = BigNumber.from(xDAI)

    if (xDAIValue.gt(totalCost)) {
      this.console.log('Transferring xDAI to Bee wallet...')
      await Rpc.sendNativeTransaction(
        this.wallet,
        this.target,
        xDAIValue.sub(totalCost).toString(),
        this.jsonRpcUrl,
        gasPrice,
      )
    }
    this.console.log('Redeem complete')
  }
}
