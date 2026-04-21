import { HistoryCommand } from './history-command'
import { Argument, LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { exit } from 'process'
import { History } from '../../service/history'

export class Show extends HistoryCommand implements LeafCommand {
  public readonly name = 'show'

  public readonly description = 'Get upload history item'

  @Argument({
    key: 'index',
    description: 'Index of the history item',
    required: true,
    type: 'number',
  })
  public index!: number

  public run() {
    super.init()
    const history = new History(this.configFolder, this.console)
    const historyItem = history.getItemByIndex(this.index)

    if (historyItem === undefined) {
      this.console.error(`Cound not find history item with index '${this.index}'`)
      exit(1)
    }
    this.console.log(createKeyValue('Timestamp', new Date(historyItem.timestamp).toUTCString()))
    this.console.log(createKeyValue('Swarm hash', historyItem.reference))
    this.console.log(createKeyValue('Stamp ID', historyItem.stamp))
    this.console.log(createKeyValue('Upload type', historyItem.uploadType))

    if (historyItem.path) {
      this.console.log(createKeyValue('Path', historyItem.path))
    }

    if (historyItem.feedAddress) {
      this.console.log(createKeyValue('Feed address', historyItem.feedAddress))
    }

    if (historyItem.feedIdentity) {
      this.console.log(createKeyValue('Feed identity', historyItem.feedIdentity))
    }
  }
}
