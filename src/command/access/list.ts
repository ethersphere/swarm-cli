import { LeafCommand, Option } from 'furious-commander'
import { exit } from 'process'
import { AccessHistory } from '../../service/access'
import { granteeListNameProperties } from '../../utils/option'
import { errorText } from '../../utils/text'
import { AccessCommand } from './access-command'

export class List extends AccessCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly description = 'List grantees of an existing grantee list'

  @Option(granteeListNameProperties)
  public listName!: string

  public async run(): Promise<void> {
    super.init()

    const accessHistory = new AccessHistory(this.commandConfig, this.console)
    const lastHistoryEvent = accessHistory.getEvents(this.listName).sort((a, b) => b.createdAt - a.createdAt)[0]

    if (!lastHistoryEvent) {
      this.console.error(errorText(`Grantee list with name '${this.listName}' does not exist!`))

      exit(1)
    }

    const response = await this.bee.getGrantees(lastHistoryEvent.granteeListRef)

    if (response.grantees.length === 0) {
      this.console.log(`Grantee list '${this.listName}' has no grantees.`)

      return
    }
    this.console.log(`Grantees of list '${this.listName}':`)
    for (const grantee of response.grantees) {
      this.console.log(grantee.toCompressedHex())
    }
  }
}
