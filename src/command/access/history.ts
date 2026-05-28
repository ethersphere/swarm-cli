import { LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { AccessHistory } from '../../service/access'
import { AccessHistoryOperation } from '../../service/access/types/history-event'
import { createKeyValue, errorText, formatDate } from '../../utils/text'
import { AccessCommand } from './access-command'

export class History extends AccessCommand implements LeafCommand {
  public readonly name = 'history'

  public readonly description = 'Show the local history of operations on a grantee list'

  @Option({
    key: 'list-name',
    alias: 'n',
    description: 'Name of the grantee list',
    required: true,
    type: 'string',
  })
  public listName!: string

  public run() {
    super.init()

    const accessHistory = new AccessHistory(this.commandConfig, this.console)
    const events = accessHistory.getEvents(this.listName).sort((a, b) => b.createdAt - a.createdAt)

    if (events.length === 0) {
      this.console.error(errorText(`Grantee list with name '${this.listName}' does not exist!`))

      exit(1)
    }

    const lastEvent = events[0]
    this.console.log(createKeyValue('Latest history address', lastEvent.historyAddress))
    this.console.log(createKeyValue('Latest grantee list reference', lastEvent.granteeListRef))

    this.console.log('')

    for (const event of events) {
      this.console.log(createKeyValue('Operation', event.operation))
      this.console.log(createKeyValue('Date', formatDate(new Date(event.createdAt))))

      if ([AccessHistoryOperation.Grant, AccessHistoryOperation.Revoke].includes(event.operation) && event.grantees) {
        this.console.log(createKeyValue('Grantees', event.grantees.join(', ')))
      }

      if (this.verbose) {
        this.console.log(createKeyValue('Stamp', event.stampId))
        this.console.log(createKeyValue('Grantee list reference', event.granteeListRef))
        this.console.log(createKeyValue('History address', event.historyAddress))
      }

      this.console.log('---')
    }
  }
}
