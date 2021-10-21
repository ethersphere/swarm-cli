import { Data } from '@ethersphere/bee-js'
import { writeFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { loadAllNodes, MantarayNode } from 'mantaray-js'
import { extendObject, referenceToHex } from '../utils'
import { Download as ManifestDownload } from './manifest/download'
import { RootCommand } from './root-command'

export class Download extends RootCommand implements LeafCommand {
  public readonly name = 'download'
  public readonly aliases = ['dl']
  public readonly description = 'Download arbitrary Swarm hash'

  @Argument({ key: 'hash', description: 'Swarm reference', required: true })
  public hash!: string

  @Option({ key: 'save', type: 'boolean', description: 'Save to file' })
  public save!: boolean

  public async run(): Promise<void> {
    await super.init()

    if (await this.isManifest()) {
      const manifestDownload = new ManifestDownload()
      extendObject(manifestDownload as unknown as Record<string, unknown>, this as unknown as Record<string, unknown>)
      manifestDownload.bzzUrl = this.hash
      await manifestDownload.run()
    } else {
      await this.downloadFile()
    }
  }

  private async downloadFile(): Promise<void> {
    const response = await this.bee.downloadFile(this.hash)
    const { name, data } = response

    if (this.save) {
      const path = name || this.hash
      writeFileSync(path, data)
    } else {
      process.stdout.write(data)
    }
  }

  private async isManifest(): Promise<boolean> {
    try {
      const response = await this.bee.downloadData(this.hash)
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
