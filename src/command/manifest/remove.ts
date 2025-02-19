import { MantarayNode } from '@upcoming/bee-js'
import { Optional } from 'cafe-utility'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { BzzAddress } from '../../utils/bzz-address'
import { CommandLineError } from '../../utils/error'
import { stampProperties } from '../../utils/option'
import { RootCommand } from '../root-command'

export class Remove extends RootCommand implements LeafCommand {
  public readonly name = 'remove'
  public readonly description = 'Remove a path from an existing manifest'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public bzzUrl!: string

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

    const address = new BzzAddress(this.bzzUrl)

    if (!address.path) {
      throw new CommandLineError('Path is required in the address to know what to remove')
    }

    const node = await MantarayNode.unmarshal(this.bee, address.hash)
    await node.loadRecursively(this.bee)
    node.removeFork(address.path)
    const root = await node.saveRecursively(this.bee, this.stamp)
    this.console.log(root.toHex())
    this.result = Optional.of(root)
  }

  protected promptAdditionalFileDelete(mainPath: string, paths: string[]): Promise<boolean> {
    return this.console.confirmAndDelete(
      `Deleting the ${mainPath} will result in deletion of the additional resources: \n\t${paths.join(
        '\n\t',
      )}\nContinue?`,
    )
  }
}
