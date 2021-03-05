import { GroupCommand } from 'furious-commander'
import { Print } from './print'
import { Update } from './update'
import { Upload } from './upload'

export class Feed implements GroupCommand {
  public readonly name = 'feed'

  public readonly description = 'Feed utilities'

  public subCommandClasses = [Update, Upload, Print]
}
