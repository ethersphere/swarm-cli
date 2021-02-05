import { IOption } from 'furious-commander/dist/option'
import { Upload } from './command/upload'
import { Identity } from './command/identity'

export const beeApiUrl: IOption<string> = {
  key: 'bee-api-url',
  default: 'http://localhost:1633',
  describe: 'URL of the Bee-client API',
} as const

export const configFolder: IOption<string> = {
  key: 'config-folder',
  describe: 'Path of the configuration files that the CLI uses',
}

export const optionParameters: IOption<unknown>[] = [beeApiUrl, configFolder]

export const rootCommandClasses = [Upload, Identity]
