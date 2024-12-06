import { Strings } from 'cafe-utility'
import { execSync } from 'child_process'
import { existsSync, writeFileSync } from 'fs'
import { LeafCommand } from 'furious-commander'
import fetch from 'node-fetch'
import { CommandLineError } from '../../utils/error'
import { RootCommand } from '../root-command'

const archTable = {
  arm64: 'arm64',
  x64: 'amd64',
}

const platformTable = {
  win32: 'windows',
  darwin: 'darwin',
  linux: 'linux',
}

export class GetBee extends RootCommand implements LeafCommand {
  public readonly name = 'get-bee'

  public readonly description = 'Downloads the Bee binary for the current platform'

  public async run(): Promise<void> {
    super.init()
    const archString = Reflect.get(archTable, process.arch)
    const platformString = Reflect.get(platformTable, process.platform)
    const suffixString = process.platform === 'win32' ? '.exe' : ''

    if (!archString || !platformString) {
      throw Error(`Unsupported system: arch=${process.arch} platform=${process.platform}`)
    }
    const url = `https://github.com/ethersphere/bee/releases/download/v2.3.0/bee-${platformString}-${archString}${suffixString}`
    this.console.info(`Downloading Bee from ${url}`)
    await fetch(url)
      .then(x => x.arrayBuffer())
      .then(x => writeFileSync(`bee${suffixString}`, Buffer.from(x)))
    this.console.info('Bee downloaded successfully')

    if (process.platform !== 'win32') {
      this.console.info(`Running chmod +x bee to make it executable`)
      execSync('chmod +x bee')
    }

    this.console.info('')
    const deployConfig = await this.console.confirm('Create a preset Bee config.yaml file?')

    if (deployConfig) {
      if (existsSync('config.yaml')) {
        throw new CommandLineError('config.yaml already exists, stopping')
      }

      this.console.info('')
      this.console.info('Ultra-light: Limited download capabilities, no requirements')
      this.console.info('Light: Upload and download, requires xDAI to launch and xBZZ to upload')

      const type = await this.console.promptList(['ultra-light', 'light'], 'Select the type of configuration to create')
      writeFileSync(
        'config.yaml',
        `api-addr: 127.0.0.1:1633
blockchain-rpc-endpoint: "https://xdai.fairdatasociety.org"
cors-allowed-origins: ["*"]
data-dir: "${process.cwd()}/data-dir"
full-node: false
mainnet: true
storage-incentives-enable: false
swap-enable: ${type === 'light' ? 'true' : 'false'}
password: "${Strings.randomAlphanumeric(20)}"`,
      )

      this.console.info('')
      this.console.info('All set! Start Bee node by running:')
      this.console.info('')
      this.console.info('./bee start --config=config.yaml')
    } else {
      this.console.info('Verify the version of the downloaded Bee binary by running:')
      this.console.info('')
      this.console.info('./bee version')
    }
  }
}
