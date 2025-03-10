import { Argument, LeafCommand, Option } from 'furious-commander'
import { GranteeCommand } from './grantee-command'
import { stampProperties } from '../../utils/option'
import { createKeyValue } from '../../utils/text'
import fs from 'fs'

export class Create extends GranteeCommand implements LeafCommand {
  public readonly name = 'create'
  public readonly description = 'Create grantee list'
  private actReqHeaders: Record<string, string> = {}

  @Argument({
    key: 'path',
    description: 'Path to the file with grantee list',
    required: true,
    autocompletePath: true,
    conflicts: 'stdin',
  })
  public path!: string

  @Option({ key: 'stdin', type: 'boolean', description: 'Take data from standard input', conflicts: 'path' })
  public stdin!: boolean

  @Option(stampProperties)
  public stamp!: string

  public async run(): Promise<void> {
    await super.init()
    this.actReqHeaders = {
      'Swarm-Act': 'true',
    }
    const granteesFile = fs.readFileSync(this.path, 'utf8')
    const createGrantees = JSON.parse(granteesFile)
    const grantees = createGrantees.grantees

    const response = await this.bee.createGrantees(this.stamp, grantees)
    this.console.log(createKeyValue('Grantee reference', response.ref.toHex()))
    this.console.log(createKeyValue('Grantee history reference', response.historyref.toHex()))
  }
}
