import { IOption } from 'furious-commander/dist/option'
import { Feed } from './command/feed'
import { Identity } from './command/identity'
import { Pinning } from './command/pinning'
import { Upload } from './command/upload'

export const beeApiUrl: IOption<string> = {
  key: 'bee-api-url',
  default: 'http://localhost:1633',
  describe: 'URL of the Bee-client API',
} as const

export const configFolder: IOption<string> = {
  key: 'config-folder',
  describe: 'Path of the configuration files that the CLI uses',
}

export const verbose: IOption<boolean> = {
  key: 'verbose',
  alias: 'v',
  describe: 'Print all console messages',
  default: false,
}

export const quiet: IOption<boolean> = {
  key: 'quiet',
  alias: 'q',
  describe: 'Only print the results',
  default: false,
}

export const optionParameters: IOption<unknown>[] = [beeApiUrl, configFolder, verbose, quiet]

export const rootCommandClasses = [Upload, Pinning, Identity, Feed]
