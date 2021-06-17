import { LeafCommand } from 'furious-commander'
import { bold, green } from 'kleur'
import { RootCommand } from './root-command'

export class Addresses extends RootCommand implements LeafCommand {
  public readonly name = 'addresses'

  public readonly description = 'Display the addresses of the Bee node'

  public async run(): Promise<void> {
    super.init()

    const nodeAddresses = await this.beeDebug.getNodeAddresses()
    const chequebookAddress = await this.beeDebug.getChequebookAddress()

    const longest = 'PSS Public Key: '.length
    this.console.log(bold('Node Addresses'))
    this.console.divider()
    this.console.log(green('Ethereum: '.padEnd(longest)) + nodeAddresses.ethereum)
    this.console.log(green('Overlay: '.padEnd(longest)) + nodeAddresses.overlay)
    this.console.log(green('PSS Public Key: ') + nodeAddresses.pssPublicKey)
    this.console.log(green('Public Key: '.padEnd(longest)) + nodeAddresses.publicKey)
    this.console.log(green('Underlay: '.padEnd(longest)) + nodeAddresses.underlay)
    this.console.log('')
    this.console.log(bold('Chequebook Address'))
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
