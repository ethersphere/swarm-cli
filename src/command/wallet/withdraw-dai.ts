import { DAI } from '@ethersphere/bee-js'
import { LeafCommand, Option } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'

export class WithdrawDAI extends RootCommand implements LeafCommand {
  public readonly name = 'withdraw-dai'

  @Option({
    key: 'address',
    type: 'hex-string',
    description: 'Target wallet address, must be allowlisted in Bee config',
    required: true,
  })
  public address!: string

  @Option({
    key: 'dai',
    description: 'Amount of xDAI to withdraw to the external wallet',
    type: 'string',
    required: true,
  })
  public amountDai!: string

  public readonly description = `Withdraw xDAI to a whitelisted wallet address`

  public async run(): Promise<void> {
    super.init()

    const amount = DAI.fromDecimalString(this.amountDai)

    this.console.log('The address you are withdrawing to must be whitelisted in the Bee config.')
    this.console.log('If you receive status code 400, the address may not be whitelisted.')
    this.console.log('')

    if (!this.quiet && !this.yes) {
      this.yes = await this.console.confirm(
        `You are about to withdraw ${amount.toDecimalString()} xDAI to ${
          this.address
        }, are you sure you wish to proceed?`,
      )
    }

    if (!this.yes && !this.quiet) {
      return
    }

    const transaction = await this.bee.withdrawDAIToExternalWallet(amount, this.address)
    this.console.log(createKeyValue('Transaction', transaction.represent()))
    this.console.log(createKeyValue('URL', `https://gnosisscan.io/tx/0x${transaction.represent()}`))
  }
}
