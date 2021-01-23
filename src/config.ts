import { IOption } from 'furious-commander/dist/option'
import { Upload } from './command/upload'

export const optionParameters: IOption<unknown>[] = [
  { key: 'bee-host', default: 'localhost', describe: 'Host address of the Bee-client' },
  {
    key: 'https',
    type: 'boolean',
    default: false,
    describe: 'The http messages will be encrypted before transmission',
  },
  { key: 'bee-api-port', default: 1633, describe: 'API port of the Bee-client' },
]

export const rootCommandClasses = [Upload]
