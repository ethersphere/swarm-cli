import { HistoryCommand } from './history-command'
import { History } from '../../service/history'
import Table from 'cli-table3'
import { LeafCommand } from 'furious-commander'
import { ellipsis } from '../../utils/text'
import { HistoryItem } from '../../service/history/types/history-item'

export class List extends HistoryCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly alias = 'ls'

  public readonly description = 'Get upload history list'

  public run() {
    super.init()
    const table = new Table({
      head: ['Index', 'Timestamp', 'Reference', 'Postage stamp batch ID', 'File path', 'Upload type'],
      style: {
        head: ['green', 'bold'],
      },
      wordWrap: true,
    })

    const history = new History(this.commandConfig.configFolderPath, this.console)
    table.push(
      ...history
        .getItems()
        .map((h: HistoryItem) => [
          h.index,
          new Date(h.timestamp).toLocaleString(),
          h.reference.slice(0, 12),
          ellipsis(h.stamp, 6, -6),
          h.path,
          h.uploadType,
        ]),
    )
    this.console.log(table.toString())
  }
}
