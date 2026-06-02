import { LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { AccessHistory } from '../../service/access'
import { AccessHistoryOperation } from '../../service/access/types/history-event'
import { granteeListNameProperties, granteeProperties } from '../../utils/option'
import { createKeyValue, errorText, successText } from '../../utils/text'
import { AccessCommand } from './access-command'

export class Grant extends AccessCommand implements LeafCommand {
  public readonly name = 'grant'

  public readonly description = 'Add grantees to an existing grantee list'

  @Option(granteeListNameProperties)
  public listName!: string

  @Option(granteeProperties)
  public grantees!: string[]

  public async run(): Promise<void> {
    super.init()

    if (this.grantees.length === 0) {
      this.console.error(errorText('At least one grantee must be specified!'))

      exit(1)
    }

    const accessHistory = new AccessHistory(this.commandConfig, this.console)
    const lastHistoryEvent = accessHistory.getEvents(this.listName).sort((a, b) => b.createdAt - a.createdAt)[0]

    if (!lastHistoryEvent) {
      this.console.error(errorText(`Grantee list with name '${this.listName}' does not exist!`))

      exit(1)
    }
    const stampId = lastHistoryEvent.stampId
    const granteeListRef = lastHistoryEvent.granteeListRef
    const historyAddress = lastHistoryEvent.historyAddress
    const response = await this.bee.patchGrantees(stampId, granteeListRef, historyAddress, { add: this.grantees })

    if (response.status === 200) {
      this.console.log(successText(`Access granted to ${this.grantees.join(', ')}`))
    }

    accessHistory.addEvent(this.listName, {
      stampId: stampId,
      historyAddress: response.historyref.toHex(),
      granteeListRef: response.ref.toHex(),
      operation: AccessHistoryOperation.Grant,
      createdAt: Date.now(),
      grantees: this.grantees,
    })

    if (this.verbose) {
      this.console.log(createKeyValue('Grantee list reference', response.ref.toHex()))
      this.console.log(createKeyValue('History address', response.historyref.toHex()))
    }
  }
}
