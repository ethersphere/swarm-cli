import { LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { AccessHistory } from '../../service/access'
import { AccessHistoryOperation } from '../../service/access/types/history-event'
import { createKeyValue } from '../../utils/text'
import { AccessCommand } from './access-command'

export class Init extends AccessCommand implements LeafCommand {
  public readonly name = 'init'

  public readonly description = 'Initialize a new access grantee list'

  @Option({
    key: 'stamp',
    description: 'Postage stamp ID',
    required: true,
    type: 'string',
  })
  public stamp!: string

  @Option({
    key: 'list-name',
    alias: 'name',
    description: 'Name of the grantee list',
    required: true,
    type: 'string',
  })
  public listName!: string

  @Option({
    key: 'grantee',
    description: 'Public address of the grantee',
    type: 'string',
    array: true,
  })
  public grantees!: string[]

  public async run(): Promise<void> {
    super.init()

    const accessHistory = new AccessHistory(this.commandConfig, this.console)

    if (accessHistory.getEventsByType(this.listName, AccessHistoryOperation.Init).length > 0) {
      this.console.error(`Grantee list with name '${this.listName}' has already been initialized!`)

      exit(1)
    }

    const response = await this.bee.createGrantees(this.stamp, this.grantees)
    this.console.log(`Grantee list '${this.listName}' initialized successfully!`)

    accessHistory.addEvent(this.listName, {
      stampId: this.stamp,
      historyAddress: response.historyref.toHex(),
      granteeListRef: response.ref.toHex(),
      operation: AccessHistoryOperation.Init,
      createdAt: Date.now(),
    })

    if (this.verbose) {
      this.console.log(createKeyValue('Grantee list reference', response.ref.toHex()))
      this.console.log(createKeyValue('History address', response.historyref.toHex()))
    }
  }
}
