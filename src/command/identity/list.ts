import { LeafCommand } from 'furious-commander'
import { exit } from 'process'
import { getPrintableIdentityType, getSimpleWallet, isSimpleWallet, isV3Wallet } from '../../service/identity'
import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'

export class List extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'list'

  public readonly aliases = ['ls']

  public readonly description = 'List keypairs which can be used to sign chunks'

  public run(): void {
    this.initCommand()

    this.console.info('List of your identities')
    this.console.divider('=')

    if (!this.commandConfig.config.identities) {
      this.console.error("You don't have any identity yet")
      this.console.info(`You can create one with command '${this.appName} identity create'`)

      exit(1)
    }

    for (const [identityName, identity] of Object.entries(this.commandConfig.config.identities)) {
      const { wallet, identityType } = identity
      let address = ''

      if (isV3Wallet(wallet, identityType)) {
        address = '0x' + wallet.address
      } else if (isSimpleWallet(wallet, identityType)) {
        address = getSimpleWallet(wallet).getAddressString()
      }
      this.console.log(createKeyValue('Identity name', identityName))
      this.console.log(createKeyValue('Identity type', getPrintableIdentityType(identity.identityType)))
      this.console.log(createKeyValue('Address', address))
      this.console.quiet(identityName, getPrintableIdentityType(identity.identityType), address)
      this.console.divider()
    }
  }

  /** Init additional properties of class, that are not handled by the CLI framework */
  private initCommand(): void {
    super.init()
  }
}
