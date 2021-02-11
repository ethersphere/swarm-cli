import { Option } from 'furious-commander'
import { bold, dim, green, red } from 'kleur'
import { exit } from 'process'
import { getWalletFromIdentity } from '../../service/identity'
import { Upload as UploadBase } from '../upload'

export class Upload extends UploadBase {
  // CLI FIELDS

  public readonly name = 'upload'

  @Option({ key: 'identity', describe: 'Name of the identity', required: true })
  public identity!: string

  @Option({ key: 'topic', describe: 'Feed topic', required: true })
  public topic!: string

  @Option({ key: 'password', describe: 'Password for the wallet' })
  public password!: string

  // CLASS FIELDS

  public async run(): Promise<void> {
    super.init()

    const identity = this.commandConfig.config.identities[this.identity]

    if (!identity) {
      console.warn(red(`Invalid identity name: '${this.identity}'`))

      exit(1)
    }
    try {
      await super.run()

      const wallet = await getWalletFromIdentity(identity, this.password)
      const signer = wallet.getPrivateKey()
      const feed = this.bee.makeFeedWriter(signer, this.topic)

      const manifestResponse = await feed.createManifest()

      const url = `${this.beeApiUrl}/bzz/${manifestResponse.reference}`
      console.log(dim('Uploading was successful!'))
      console.log(bold(`Manifest -> ${green(url)}`))
    } catch (e) {
      console.warn(red(e.message))

      exit(1)
    }
  }
}
