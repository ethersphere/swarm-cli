import { Argument, LeafCommand, Option } from 'furious-commander'
import { pickStamp } from '../../service/stamp'
import { BzzAddress } from '../../utils/bzz-address'
import { stampProperties } from '../../utils/option'
import { ManifestCommand } from './manifest-command'

export class Remove extends ManifestCommand implements LeafCommand {
  public readonly name = 'remove'
  public readonly description = 'Remove a path from an existing manifest'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public bzzUrl!: string

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.beeDebug, this.console)
    }

    const address = new BzzAddress(this.bzzUrl)
    const { node } = await this.initializeNode(address.hash)
    const forks = this.findAllValueForks(node)
    for (const fork of forks) {
      if (fork.path === address.path || fork.path.startsWith(address.path + '/')) {
        const childPaths = this.findAllValueForks(fork.node).map(({ path }) => fork.path + path)

        if (childPaths.length > 0) {
          const confirmed = await this.promptAdditionalFileDelete(fork.path, childPaths)

          if (!confirmed) {
            continue
          }
        }

        node.removePath(this.encodePath(fork.path))
      }
    }
    await this.saveAndPrintNode(node, this.stamp)
  }

  protected promptAdditionalFileDelete(mainPath: string, paths: string[]): Promise<boolean> {
    return this.console.confirmAndDelete(
      `Deleting the ${mainPath} will result in deletion of the additional resources: \n\t${paths.join(
        '\n\t',
      )}\nContinue?`,
    )
  }
}
