import { LeafCommand, Option } from 'furious-commander'
import { stampProperties } from '../../utils/option'
import { PinningCommand } from './pinning-command'

export class ReuploadAll extends PinningCommand implements LeafCommand {
  public readonly name = 'reupload-all'

  public readonly description = 'Reupload all locally pinned content'

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()

    const chunks = await this.bee.getAllPins()

    const total = chunks.length
    let successful = 0

    this.console.log(`Found ${total} root chunks to reupload...`)

    for (const chunk of chunks) {
      try {
        await this.reuploadOne(chunk.toHex())
        successful++
      } catch (error) {
        this.console.error('Failed to reupload ' + chunk)
        this.console.printBeeError(error)
      }
    }

    this.console.log(`Reuploaded ${successful} out of ${total} pinned root chunks`)
    this.console.quiet(successful + '/' + total)
  }

  private async reuploadOne(chunk: string): Promise<void> {
    this.console.log('Reuploading ' + chunk + '...')
    await this.bee.reuploadPinnedData(this.stamp, chunk)
    this.console.log('Reuploaded successfully.')
  }
}
