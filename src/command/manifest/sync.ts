import { makeChunkedFile } from '@fairdatasociety/bmt-js'
import chalk from 'chalk'
import { readFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { Reference } from 'mantaray-js'
import { join } from 'path'
import { pickStamp } from '../../service/stamp'
import { readdirDeepAsync } from '../../utils'
import { BzzAddress } from '../../utils/bzz-address'
import { bytesToHex } from '../../utils/hex'
import { stampProperties } from '../../utils/option'
import { ManifestCommand } from './manifest-command'

export class Sync extends ManifestCommand implements LeafCommand {
  public readonly name = 'sync'
  public readonly description = 'Sync a local folder to an existing manifest'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public bzzUrl!: string

  @Argument({ key: 'folder', description: 'Local folder to be synced', required: true })
  public folder!: string

  @Option(stampProperties)
  public stamp!: string

  @Option({
    key: 'remove',
    type: 'boolean',
    description: 'Remove paths that do not exist locally',
  })
  public remove!: boolean

  public async run(): Promise<void> {
    await super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.beeDebug, this.console)
    }
    const address = new BzzAddress(this.bzzUrl)
    const { node } = await this.initializeNode(address.hash)
    const files = await readdirDeepAsync(this.folder, this.folder)
    const forks = this.getForksPathMapping(this.findAllValueForks(node))
    for (const file of files) {
      const fork = forks[file]

      if (fork) {
        fork.found = true

        if (!fork.node.getEntry) {
          continue
        }

        const remoteAddress = Buffer.from(fork.node.getEntry).toString('hex')

        const localData = readFileSync(join(this.folder, file))
        const rootChunk = makeChunkedFile(localData).rootChunk()
        const localAddress = bytesToHex(rootChunk.address())

        if (localAddress === remoteAddress) {
          this.console.log(chalk.gray(file) + ' ' + chalk.blue('UNCHANGED'))
        } else {
          const { reference } = await this.bee.uploadData(this.stamp, localData)
          node.addFork(this.encodePath(file), Buffer.from(reference, 'hex') as Reference)
          this.console.log(chalk.gray(file) + ' ' + chalk.yellow('CHANGED'))
        }
      } else {
        const { reference } = await this.bee.uploadData(this.stamp, readFileSync(join(this.folder, file)))
        node.addFork(this.encodePath(file), Buffer.from(reference, 'hex') as Reference)
        this.console.log(chalk.gray(file) + ' ' + chalk.green('NEW'))
      }
    }

    if (this.remove) {
      for (const fork of Object.values(forks).filter(x => !x.found)) {
        node.removePath(this.encodePath(fork.path))
        this.console.log(chalk.gray(fork.path) + ' ' + chalk.red('REMOVED'))
      }
    }
    await this.saveAndPrintNode(node, this.stamp)
  }
}
