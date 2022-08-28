import chalk from 'chalk'
import { LeafCommand } from 'furious-commander'
import { PinningCommand } from './pinning-command'

export class List extends PinningCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly alias = 'ls'

  public readonly description = 'List pinned root hashes'

  public async run(): Promise<void> {
    await super.init()
    this.console.info('Getting pinned root hashes...')

    const pins = await this.bee.getAllPins()

    this.console.log(chalk.bold(`Found ${pins.length} pinned root hashes`))
    this.console.log('')

    for (const pin of pins) {
      this.console.log(pin)
      this.console.quiet(pin)
    }
  }
}
