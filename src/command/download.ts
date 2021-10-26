import { Data } from '@ethersphere/bee-js'
import { writeFileSync } from 'fs'
import { Aggregation, LeafCommand, Option } from 'furious-commander'
import { loadAllNodes, MantarayNode } from 'mantaray-js'
import { referenceToHex } from '../utils'
import { BzzAddress } from '../utils/bzz-address'
import { Download as ManifestDownload } from './manifest/download'
import { RootCommand } from './root-command'

export class Download extends RootCommand implements LeafCommand {
  public readonly name = 'download'
  public readonly aliases = ['dl']
  public readonly description = 'Download arbitrary Swarm hash'

  @Aggregation(['manifest download'])
  public manifestDownload!: ManifestDownload

  @Option({ key: 'stdout', type: 'boolean', description: 'Print to stdout (single files only)' })
  public stdout!: boolean

  private address!: BzzAddress

  public async run(): Promise<void> {
    await super.init()

    this.address = new BzzAddress(this.manifestDownload.bzzUrl)

    if (await this.isManifest()) {
      this.console.log('Given address is a manifest - downloading...')
      await this.manifestDownload.run()
    } else {
      await this.downloadFile()
    }
  }

  private async downloadFile(): Promise<void> {
    const response = await this.bee.downloadFile(this.address.hash)
    const { name, data } = response

    if (this.stdout) {
      process.stdout.write(data)
    } else {
      const path = this.manifestDownload.destination || name || this.address.hash
      writeFileSync(path, data)
    }
  }

  private async isManifest(): Promise<boolean> {
    try {
      const response = await this.bee.downloadData(this.address.hash)
      const node = new MantarayNode()
      node.deserialize(response)
      await loadAllNodes(this.load.bind(this), node)

      return true
    } catch {
      return false
    }
  }

  private load(reference: Uint8Array): Promise<Data> {
    return this.bee.downloadData(referenceToHex(reference))
  }
}
