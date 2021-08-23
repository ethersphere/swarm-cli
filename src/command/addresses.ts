import { NodeAddresses } from '@ethersphere/bee-js'
import chalk from 'chalk'
import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../utils/text'
import { RootCommand } from './root-command'

export class Addresses extends RootCommand implements LeafCommand {
  public readonly name = 'addresses'

  public readonly description = 'Display the addresses of the Bee node'

  public nodeAddresses!: NodeAddresses

  public chequebookAddress!: string

  public async run(): Promise<void> {
    await super.init()

    this.nodeAddresses = await this.beeDebug.getNodeAddresses()
    this.chequebookAddress = (await this.beeDebug.getChequebookAddress()).chequebookAddress

    const longest = 'PSS Public Key'.length
    this.console.log(chalk.bold('Node Addresses'))
    this.console.divider()
    this.console.log(createKeyValue('Ethereum', this.nodeAddresses.ethereum, longest))
    this.console.log(createKeyValue('Overlay', this.nodeAddresses.overlay, longest))
    this.console.log(createKeyValue('PSS Public Key', this.nodeAddresses.pssPublicKey, longest))
    this.console.log(createKeyValue('Public Key', this.nodeAddresses.publicKey, longest))
    this.console.log(createKeyValue('Underlay', this.nodeAddresses.underlay.join(' '), longest))
    this.console.log('')
    this.console.log(chalk.bold('Chequebook Address'))
    this.console.divider()
    this.console.log(this.chequebookAddress)

    this.console.quiet('Ethereum ' + this.nodeAddresses.ethereum)
    this.console.quiet('Overlay ' + this.nodeAddresses.overlay)
    this.console.quiet('PSS_Public_Key ' + this.nodeAddresses.pssPublicKey)
    this.console.quiet('Public_Key ' + this.nodeAddresses.publicKey)
    this.console.quiet('Underlay ' + this.nodeAddresses.underlay)
    this.console.quiet('Chequebook ' + this.chequebookAddress)
  }
}
