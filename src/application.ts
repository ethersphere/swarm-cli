import { Application } from 'furious-commander/dist/application'
import PackageJson from '../package.json'

export const application: Application = {
  name: 'Swarm CLI',
  command: 'swarm-cli',
  description: 'Manage your Bee node and interact with the Swarm network via the CLI',
  version: PackageJson.version,
  autocompletion: 'fromOption',
}
