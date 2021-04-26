import { IOption } from 'furious-commander'
import PackageJson from '../package.json'
import { Cheque } from './command/cheque'
import { Feed } from './command/feed'
import { Identity } from './command/identity'
import { Pinning } from './command/pinning'
import { Upload } from './command/upload'

export const beeApiUrl: IOption<string> = {
  key: 'bee-api-url',
  default: 'http://localhost:1633',
  description: 'URL of the Bee-client API',
  envKey: 'BEE_API_URL',
}

export const beeDebugApiUrl: IOption<string> = {
  key: 'bee-debug-api-url',
  default: 'http://localhost:1635',
  description: 'URL of the Bee-client Debug API',
  envKey: 'BEE_DEBUG_API_URL',
}

export const configFolder: IOption<string> = {
  key: 'config-folder',
  description: 'Path of the configuration files that the CLI uses',
  envKey: 'SWARM_CLI_CONFIG_FOLDER',
}

export const verbose: IOption<boolean> = {
  key: 'verbose',
  alias: 'v',
  description: 'Print all console messages',
  type: 'boolean',
  default: false,
}

export const quiet: IOption<boolean> = {
  key: 'quiet',
  alias: 'q',
  description: 'Only print the results',
  type: 'boolean',
  default: false,
}

export const help: IOption<boolean> = {
  key: 'help',
  alias: 'h',
  description: 'Print context specific help and exit',
  type: 'boolean',
  default: false,
}

export const version: IOption<boolean> = {
  key: 'version',
  alias: 'V',
  description: 'Print version and exit',
  type: 'boolean',
  default: false,
  handler: () => {
    console.log(PackageJson.version)
  },
}

export const optionParameters: IOption<unknown>[] = [
  beeApiUrl,
  beeDebugApiUrl,
  configFolder,
  verbose,
  quiet,
  help,
  version,
]

export const rootCommandClasses = [Upload, Pinning, Identity, Feed, Cheque]
