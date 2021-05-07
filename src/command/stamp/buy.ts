import { LeafCommand, Option } from 'furious-commander'
import inquirer from 'inquirer'
import { exit } from 'process'
import { RootCommand } from '../root-command'

export class Buy extends RootCommand implements LeafCommand {
  public readonly name = 'buy'

  public readonly aliases = []

  public readonly description = 'Buy postage stamp'

  @Option({ key: 'capacity', description: 'Capacity of the postage stamp', required: true })
  public address!: string

  @Option({ key: 'lifetime', description: 'Lifetime of the postage stamp', required: true })
  public lifetime!: string

  @Option({ key: 'accept', description: 'Auto-confirm cost', alias: 'y', type: 'boolean', default: false })
  public confirm!: boolean

  public async run(): Promise<void> {
    super.init()
    this.console.info(`Buying postage stamp...`)
    const cost = await this.calculateCost()
    this.console.info(`Expected cost: ${cost} BZZ`)
    await this.confirmPurchase()
    this.console.info(`Postage stamp bought successfully.`)
  }

  private async confirmPurchase(): Promise<void> {
    const approve = await inquirer.prompt({
      type: 'confirm',
      name: 'question',
      message: `Confirm purchase?`,
    })

    if (!approve.question) {
      this.console.log('Cancelled')
      exit(1)
    }
  }

  private async calculateCost(): Promise<bigint> {
    return BigInt(90000000000)
  }
}
