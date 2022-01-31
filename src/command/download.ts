import fs from 'fs'
import { Aggregation, LeafCommand } from 'furious-commander'
import { MantarayNode } from 'mantaray-js'
import { BzzAddress, makeBzzAddress } from '../utils/bzz-address'
import { Download as ManifestDownload } from './manifest/download'
import { RootCommand } from './root-command'

export class Download extends RootCommand implements LeafCommand {
  public readonly name = 'download'
  public readonly alias = 'dl'
  public readonly description = 'Download arbitrary Swarm hash'

  @Aggregation(['manifest download'])
  public manifestDownload!: ManifestDownload

  private address!: BzzAddress

  public async run(): Promise<void> {
    await super.init()

    this.address = await makeBzzAddress(this.bee, this.manifestDownload.bzzUrl)

    if (await this.isManifest()) {
      this.manifestDownload.address = this.address
      await this.manifestDownload.run()
    } else {
      await this.downloadFile()
    }
  }

  private async downloadFile(): Promise<void> {
    const response = await this.bee.downloadFile(this.address.hash)
    const { name, data } = response

    if (this.manifestDownload.stdout) {
      process.stdout.write(data)
    } else {
      const path = this.manifestDownload.destination || name || this.address.hash
      await fs.promises.writeFile(path, data)
    }
  }

  private async isManifest(): Promise<boolean> {
    try {
      const response = await this.bee.downloadData(this.address.hash)
      const node = new MantarayNode()
      node.deserialize(response)

      return true
    } catch {
      return false
    }
  }
}
