import { IOption } from 'furious-commander'
import PackageJson from '../package.json'
import { Addresses } from './command/addresses'
import { Cheque } from './command/cheque'
import { Feed } from './command/feed'
import { Identity } from './command/identity'
import { Pinning } from './command/pinning'
import { Pss } from './command/pss'
import { Stamp } from './command/stamp'
import { Status } from './command/status'
import { Upload } from './command/upload'

export const beeApiUrl: IOption<string> = {
  key: 'bee-api-url',
  default: 'http://localhost:1633',
  description: 'URL of the Bee-client API',
  envKey: 'BEE_API_URL',
  required: {
    when: 'bee-debug-api-url',
  },
}

export const beeDebugApiUrl: IOption<string> = {
  key: 'bee-debug-api-url',
  default: 'http://localhost:1635',
  description: 'URL of the Bee-client Debug API',
  envKey: 'BEE_DEBUG_API_URL',
  required: {
    when: 'bee-api-url',
  },
}

export const configFolder: IOption<string> = {
  key: 'config-folder',
  description: 'Path to the configuration folder that the CLI uses',
  envKey: 'SWARM_CLI_CONFIG_FOLDER',
}

export const configFile: IOption<string> = {
  key: 'config-file',
  description: 'Name of the configuration file that the CLI uses',
  envKey: 'SWARM_CLI_CONFIG_FILE',
  default: 'config.json',
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
    process.stdout.write(PackageJson.version + '\n')
  },
}

export const curl: IOption<boolean> = {
  key: 'curl',
  description: 'Print curl commands for debug purposes',
  type: 'boolean',
  default: false,
}

export const optionParameters: IOption<unknown>[] = [
  beeApiUrl,
  beeDebugApiUrl,
  configFolder,
  configFile,
  verbose,
  quiet,
  help,
  version,
  curl,
]

export const rootCommandClasses = [Upload, Status, Pinning, Identity, Feed, Cheque, Stamp, Pss, Addresses]
