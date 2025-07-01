import { Contract } from 'ethers'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { makeReadySigner } from '../../utils/rpc'
import { RootCommand } from '../root-command'
import { createWallet } from '../utility'

export class Recover extends RootCommand implements LeafCommand {
  public readonly name = 'recover'

  public readonly description = 'Recovers xBZZ from paused staking contracts'

  @Argument({
    key: 'wallet-source',
    description: 'Wallet source (path or private key string)',
    required: true,
    autocompletePath: true,
  })
  public walletSource!: string

  @Option({
    key: 'json-rpc-url',
    type: 'string',
    description: 'Gnosis JSON-RPC URL',
    default: 'https://xdai.fairdatasociety.org',
  })
  public jsonRpcUrl!: string

  public async run(): Promise<void> {
    super.init()

    const address = '0x445B848e16730988F871c4a09aB74526d27c2Ce8'
    const abi = [
      {
        inputs: [],
        name: 'migrateStake',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [],
        name: 'paused',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ]

    const wallet = await createWallet(this.walletSource, this.console)
    const signer = await makeReadySigner(wallet.getPrivateKeyString(), this.jsonRpcUrl)
    const contract = new Contract(address, abi, signer)

    const isPaused = await contract.paused()

    if (!isPaused) {
      this.console.error('The contract is not paused. No need to recover xBZZ.')

      return
    }

    this.console.log('Recovering xBZZ from paused staking contract...')
    await contract.migrateStake()
  }
}
