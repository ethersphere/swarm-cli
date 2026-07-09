import { ChequebookAddressResponse, NodeAddresses } from '@ethersphere/bee-js'
import { Optional } from 'cafe-utility'
import chalk from 'chalk'
import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../utils/text'
import { RootCommand } from './root-command'

export class Addresses extends RootCommand implements LeafCommand {
  public readonly name = 'addresses'

  public readonly description = 'Display the addresses of the Bee node'

  public nodeAddresses!: NodeAddresses

  public async run(): Promise<void> {
    super.init()

    this.nodeAddresses = await this.bee.getNodeAddresses()
    const wrappedChequebookAddress = await this.bee
      .getChequebookAddress()
      .then(x => {
        return Optional.of(x)
      })
      .catch(() => {
        this.console.error('Could not fetch chequebook address')
        this.console.error('This is expected if chequebook-enable: false is set in the configuration')
        this.console.error('or when the Bee node is still syncing with the blockchain')
        this.console.log('')

        return Optional.empty<ChequebookAddressResponse>()
      })

    const longest = 'PSS Public Key'.length
    this.console.log(chalk.bold('Node Addresses'))
    this.console.divider()
    this.console.log(createKeyValue('Ethereum', this.nodeAddresses.ethereum.toHex(), longest))
    this.console.log(createKeyValue('Overlay', this.nodeAddresses.overlay.toHex(), longest))
    this.console.log(createKeyValue('PSS Public Key', this.nodeAddresses.pssPublicKey.toCompressedHex(), longest))
    this.console.log(createKeyValue('Public Key', this.nodeAddresses.publicKey.toCompressedHex(), longest))
    this.console.log(createKeyValue('Underlay', this.nodeAddresses.underlay.join(' '), longest))

    wrappedChequebookAddress.ifPresent(chequebookAddress => {
      this.console.log('')
      this.console.log(chalk.bold('Chequebook Address'))
      this.console.divider()
      this.console.log(chequebookAddress.chequebookAddress.toHex())
    })

    this.console.quiet('Ethereum ' + this.nodeAddresses.ethereum)
    this.console.quiet('Overlay ' + this.nodeAddresses.overlay)
    this.console.quiet('PSS_Public_Key ' + this.nodeAddresses.pssPublicKey)
    this.console.quiet('Public_Key ' + this.nodeAddresses.publicKey)
    this.console.quiet('Underlay ' + this.nodeAddresses.underlay)
    wrappedChequebookAddress.ifPresent(chequebookAddress => {
      this.console.quiet('Chequebook ' + chequebookAddress.chequebookAddress)
    })
  }
}
