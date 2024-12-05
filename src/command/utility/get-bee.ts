import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { LeafCommand } from 'furious-commander'
import fetch from 'node-fetch'
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
      this.console.info(`Running chmod +x bee`)
      execSync('chmod +x bee')
    }
    this.console.log('Verify the version of the downloaded Bee binary by running:')
    this.console.log('')
    this.console.log('./bee version')
  }
}
