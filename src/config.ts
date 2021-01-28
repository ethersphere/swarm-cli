import { IOption } from 'furious-commander/dist/option'
import { Upload } from './command/upload'

export const defaultBeeApiUrl = 'http://localhost:1633'

export const optionParameters: IOption<unknown>[] = [
  { key: 'bee-api-url', default: defaultBeeApiUrl, describe: 'URL of the Bee-client API' },
]

export const rootCommandClasses = [Upload]
