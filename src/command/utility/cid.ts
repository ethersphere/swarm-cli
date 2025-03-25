import { Reference } from '@ethersphere/bee-js'
import { Argument, LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'

export class Cid extends RootCommand implements LeafCommand {
  public readonly name = 'cid'

  public readonly description = 'Convert to or from a CID'

  @Argument({
    key: 'value',
    description: 'CID or reference',
    required: true,
  })
  public value!: string

  public async run(): Promise<void> {
    super.init()

    const reference = new Reference(this.value)
    this.console.all(createKeyValue('CID (feed)', reference.toCid('feed')))
    this.console.all(createKeyValue('CID (manifest)', reference.toCid('manifest')))
    this.console.all(createKeyValue('Reference', reference.toHex()))
  }
}
