import fs from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { stampProperties } from '../../utils/option'
import { createKeyValue } from '../../utils/text'
import { GranteeCommand } from './grantee-command'

export class Patch extends GranteeCommand implements LeafCommand {
  public readonly name = 'patch'
  public readonly description = 'Patch grantee list'
  private actReqHeaders: Record<string, string> = {}

  @Argument({
    key: 'path',
    description: 'Path to the JSON file with grantee patch (add, revoke)',
    required: true,
    autocompletePath: true,
    conflicts: 'stdin',
  })
  public path!: string

  @Option({ key: 'stdin', type: 'boolean', description: 'Take data from standard input', conflicts: 'path' })
  public stdin!: boolean

  @Option(stampProperties)
  public stamp!: string

  @Option({
    key: 'reference',
    type: 'string',
    description: 'Encrypted grantee list reference with 128 characters length',
    length: 128,
    required: true,
  })
  public eref!: string

  @Option({
    key: 'history',
    type: 'string',
    description: 'Swarm address reference to the ACT history entry',
    length: 64,
    required: true,
  })
  public history!: string

  public async run(): Promise<void> {
    super.init()
    this.actReqHeaders = {
      'Swarm-Act': 'true',
      'Swarm-Act-Timestamp': Date.now().toString(),
    }
    const patchContent = fs.readFileSync(this.path, 'utf8')
    const patch = JSON.parse(patchContent)

    const response = await this.bee.patchGrantees(this.stamp, this.eref, this.history, patch, this.actReqHeaders)
    this.console.log(createKeyValue('Grantee reference', response.ref.toHex()))
    this.console.log(createKeyValue('Grantee history reference', response.historyref.toHex()))
  }
}
