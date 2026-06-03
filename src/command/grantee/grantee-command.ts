import { deprecationWarningText } from '../../utils/text'
import { RootCommand } from '../root-command'

export class GranteeCommand extends RootCommand {
  protected init(): void {
    super.init()
    this.console.log(
      deprecationWarningText(
        '`grantee` commands are deprecated and will be removed in the future. Please use `access` commands instead.',
      ),
    )
  }
}
