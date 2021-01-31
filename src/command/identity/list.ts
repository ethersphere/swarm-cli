import { LeafCommand } from 'furious-commander'
import { RootCommand } from '../root-command'
import { bold, italic, red } from 'kleur'
import { divider } from '../../utils/console-log'
import { getPrintableIdentityType, getSimpleWallet, isSimleWallet, isV3Wallet } from '../../service/identity'

export class List extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'list'

  public readonly description = 'List keypairs which can be used to sign chunks'

  public run(): void {
    this.initCommand()

    console.log('List of your identities')
    divider('=')

    if (!this.commandConfig.config.identities) {
      console.log(red("You don't have any identity yet"))
      console.log(italic(`You can create one with command '${this.appName} identity create'`))

      return
    }

    for (const [identityName, identity] of Object.entries(this.commandConfig.config.identities)) {
      console.log(bold(`Identity name \t ${identityName}`))
      console.log(`Identity type \t ${getPrintableIdentityType(identity.identityType)}`)
      const { wallet, identityType } = identity
      let address = ''

      if (isV3Wallet(wallet, identityType)) {
        address = '0x' + wallet.address
      } else if (isSimleWallet(wallet, identityType)) {
        address = getSimpleWallet(wallet).getAddressString()
      }
      console.log(`Address \t ${address}`)
      divider()
    }
  }

  /** Init additional properties of class, that are not handled by the CLI framework */
  private initCommand(): void {
    super.init()
  }
}
