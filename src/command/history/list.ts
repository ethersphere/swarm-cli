import { HistoryCommand } from './history-command'
import { getHistory } from '../../service/history'
import Table from 'cli-table3'
import { LeafCommand } from 'furious-commander'

export class List extends HistoryCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly description = 'Get upload history list'

  public run() {
    super.init()
    const table = new Table({
      head: ['Timestamp', 'Reference', 'Postage stamp batch ID', 'File path', 'Upload type'],
      wordWrap: true,
    })
    const history = getHistory()
    table.push(
      ...history.map(h => [
        new Date(h.timestamp).toLocaleString(),
        this.ellipsis(h.reference),
        this.ellipsis(h.stamp),
        h.path,
        h.uploadType,
      ]),
    )
    this.console.log(table.toString())
  }

  private ellipsis(value: string): string {
    return `${value.slice(0, 6)}...${value.slice(-6)}`
  }
}
