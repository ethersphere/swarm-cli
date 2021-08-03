import chalk from 'chalk'
import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../utils/text'
import { RootCommand } from './root-command'

export class Addresses extends RootCommand implements LeafCommand {
  public readonly name = 'addresses'

  public readonly description = 'Display the addresses of the Bee node'

  public async run(): Promise<void> {
    super.init()

    const nodeAddresses = await this.getBeeDebug().getNodeAddresses()
    const chequebookAddress = await this.getBeeDebug().getChequebookAddress()

    const longest = 'PSS Public Key'.length
    this.console.log(chalk.bold('Node Addresses'))
    this.console.divider()
    this.console.log(createKeyValue('Ethereum', nodeAddresses.ethereum, longest))
    this.console.log(createKeyValue('Overlay', nodeAddresses.overlay, longest))
    this.console.log(createKeyValue('PSS Public Key', nodeAddresses.pssPublicKey, longest))
    this.console.log(createKeyValue('Public Key', nodeAddresses.publicKey, longest))
    this.console.log(createKeyValue('Underlay', nodeAddresses.underlay.join(' '), longest))
    this.console.log('')
    this.console.log(chalk.bold('Chequebook Address'))
    this.console.divider()
    this.console.log(chequebookAddress.chequebookAddress)

    this.console.quiet('Ethereum ' + nodeAddresses.ethereum)
    this.console.quiet('Overlay ' + nodeAddresses.overlay)
    this.console.quiet('PSS_Public_Key ' + nodeAddresses.pssPublicKey)
    this.console.quiet('Public_Key ' + nodeAddresses.publicKey)
    this.console.quiet('Underlay ' + nodeAddresses.underlay)
    this.console.quiet('Chequebook ' + chequebookAddress.chequebookAddress)
  }
}
