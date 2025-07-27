import { Bytes, MantarayNode } from '@ethersphere/bee-js'
import fs from 'fs'
import { Aggregation, LeafCommand } from 'furious-commander'
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
    super.init()

    this.address = await makeBzzAddress(this.bee, this.manifestDownload.bzzUrl)

    if (await this.isManifest()) {
      this.manifestDownload.address = this.address
      await this.manifestDownload.run()
    } else {
      await this.downloadData()
    }
  }

  private async downloadData(): Promise<void> {
    let response: Bytes
    let nameOverride: string | undefined

    if (this.manifestDownload.act) {
      const responseAct = await this.bee.downloadFile(this.address.hash, this.manifestDownload.destination, {
        actPublisher: this.manifestDownload.actPublisher,
        actHistoryAddress: this.manifestDownload.actHistoryAddress,
        actTimestamp: this.manifestDownload.actTimestamp,
      })
      response = responseAct.data
    } else {
      if (this.address.hash.length === 128) {
        const fileData = await this.bee.downloadFile(this.address.hash, undefined)
        nameOverride = fileData.name
        response = fileData.data
      } else {
        response = await this.bee.downloadData(this.address.hash, undefined)
      }
    }

    if (this.manifestDownload.stdout) {
      process.stdout.write(response.toUtf8())
    } else {
      const path = this.manifestDownload.destination || nameOverride || this.address.hash
      await fs.promises.writeFile(path, response.toUint8Array())
    }
  }

  private async isManifest(): Promise<boolean> {
    try {
      const node = await MantarayNode.unmarshal(this.bee, this.address.hash)
      await node.loadRecursively(this.bee)

      return true
    } catch {
      return false
    }
  }
}
