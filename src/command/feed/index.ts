import { GroupCommand } from 'furious-commander'
import { Update } from './update'
import { Upload } from './upload'
import { Verify } from './verify'

export class Feed implements GroupCommand {
  public readonly name = 'feed'

  public readonly description = 'Feed utilities'

  public subCommandClasses = [Update, Upload, Verify]
}
