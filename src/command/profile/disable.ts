import { LeafCommand } from 'furious-commander'
import { profileConfig } from '../../profile'
import { RootCommand } from '../root-command'

export class Disable extends RootCommand implements LeafCommand {
  public readonly name = 'disable'

  public readonly description = 'Disable active profile'

  public async run(): Promise<void> {
    await super.init()

    profileConfig.disable()
  }
}
