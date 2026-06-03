import { LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { AccessHistory } from '../../service/access'
import { AccessHistoryOperation } from '../../service/access/types/history-event'
import { pickStamp } from '../../service/stamp'
import { granteeListNameProperties, granteeProperties, stampProperties } from '../../utils/option'
import { createKeyValue } from '../../utils/text'
import { AccessCommand } from './access-command'

export class Init extends AccessCommand implements LeafCommand {
  public readonly name = 'init'

  public readonly description = 'Initialize a new access grantee list'

  @Option(stampProperties)
  public stamp!: string

  @Option(granteeListNameProperties)
  public listName!: string

  @Option(granteeProperties)
  public grantees!: string[]

  public async run(): Promise<void> {
    super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

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
