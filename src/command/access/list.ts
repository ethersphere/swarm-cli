import { LeafCommand } from 'furious-commander'
import { AccessHistory } from '../../service/access'
import { AccessCommand } from './access-command'

export class List extends AccessCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly description = 'List grantee lists'

  public run() {
    super.init()

    const accessHistory = new AccessHistory(this.commandConfig, this.console)
    const granteeListNames = Object.keys(accessHistory.getHistory())

    if (granteeListNames.length === 0) {
      this.console.log('No grantee lists found.')

      return
    }

    this.console.log(`Grantee lists: \n`)
    for (const listName of granteeListNames) {
      this.console.log(listName)
    }
  }
}
