import Wallet from 'ethereumjs-wallet'
import { readFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import ora from 'ora'
import { exit } from 'process'
import { IdentityType } from '../../service/identity/types'
import { fileExists } from '../../utils'
import { createSpinner } from '../../utils/spinner'
import { RootCommand } from '../root-command'
import { VerbosityLevel } from '../root-command/command-log'

export class Import extends RootCommand implements LeafCommand {
  // CLI FIELDS

  public readonly name = 'import'

  public readonly description = 'Import V3 wallet as a new identity'

  @Argument({ key: 'path', required: true, description: 'Path to the V3 wallet file' })
  public path!: string

  @Option({ key: 'identity-name', alias: 'i', description: 'Name of the identity to be saved as' })
  public identityName!: string

  @Option({ key: 'password', alias: 'P', description: 'Password for the V3 wallet' })
  public password!: string

  public async run(): Promise<void> {
    this.initCommand()
    this.checkForValidPath()
    await this.ensurePasswordIsProvided()
    const data = readFileSync(this.path).toString()
    await this.ensureIdentityNameIsProvided()
    const spinner: ora.Ora = createSpinner('Decrypting V3 wallet...')

    if (this.verbosity === VerbosityLevel.Verbose) {
      spinner.start()
    }
    const wallet: Wallet = await this.decryptV3Wallet(data)
    spinner.text = 'Importing V3 wallet...'
    await this.saveWallet(wallet)
    spinner.stop()
    this.console.log(`V3 Wallet imported as identity '${this.identityName}' successfully`)
  }

  /** Init additional properties of class, that are not handled by the CLI framework */
  private initCommand(): void {
    super.init()
  }

  private async decryptV3Wallet(data: string): Promise<Wallet> {
    try {
      const wallet: Wallet = await Wallet.fromV3(data, this.password)

      return wallet
    } catch (error) {
      this.console.error('Failed to decrypt wallet:\n' + error.message)

      exit(1)
    }
  }

  private async ensurePasswordIsProvided(): Promise<void> {
    if (!this.password) {
      this.console.log('You have not defined the password with the "--password" option.')
      this.password = await this.console.askForPassword('Please provide the password for this V3 Wallet')
    }
  }

  private async ensureIdentityNameIsProvided(): Promise<void> {
    if (!this.identityName) {
      this.console.log('You have not defined the identity name with the "--identity-name" option.')
    } else if (this.commandConfig.config.identities[this.identityName]) {
      this.console.error('An identity with that name already exists, please try again.')
    }
    while (!this.identityName || this.commandConfig.config.identities[this.identityName]) {
      const value = await this.console.askForValue('Please specify an identity name now.')

      if (this.commandConfig.config.identities[value]) {
        this.console.error('An identity with that name already exists, please try again.')
      } else {
        this.identityName = value
      }
    }
  }

  private async saveWallet(wallet: Wallet): Promise<void> {
    const successfulSave = this.commandConfig.saveIdentity(this.identityName, {
      wallet: await wallet.toV3(this.password),
      identityType: IdentityType.v3,
    })

    if (!successfulSave) {
      this.console.error(`Identity '${this.identityName}' already exist.`)

      exit(1)
    }
  }

  private checkForValidPath(): void {
    if (!fileExists(this.path)) {
      this.console.error('There is no file at the specified path')

      exit(1)
    }
  }
}
