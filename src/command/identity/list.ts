import { LeafCommand } from 'furious-commander'
import { bold } from 'kleur'
import { getPrintableIdentityType, getSimpleWallet, isSimpleWallet, isV3Wallet } from '../../service/identity'
import { RootCommand } from '../root-command'

export class List extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'list'

  public readonly aliases = ['l', 'ls']

  public readonly description = 'List keypairs which can be used to sign chunks'

  public run(): void {
    this.initCommand()

    this.console.info('List of your identities')
    this.console.divider('=')

    if (!this.commandConfig.config.identities) {
      this.console.error("You don't have any identity yet")
      this.console.info(`You can create one with command '${this.appName} identity create'`)

      return
    }

    for (const [identityName, identity] of Object.entries(this.commandConfig.config.identities)) {
      this.console.log(bold(`Identity name \t ${identityName}`))
      this.console.log(`Identity type \t ${getPrintableIdentityType(identity.identityType)}`)
      const { wallet, identityType } = identity
      let address = ''

      if (isV3Wallet(wallet, identityType)) {
        address = '0x' + wallet.address
      } else if (isSimpleWallet(wallet, identityType)) {
        address = getSimpleWallet(wallet).getAddressString()
      }
      this.console.log(`Address \t ${address}`)
      this.console.divider()
    }
  }

  /** Init additional properties of class, that are not handled by the CLI framework */
  private initCommand(): void {
    super.init()
  }
}
