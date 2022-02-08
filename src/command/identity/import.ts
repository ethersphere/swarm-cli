import Wallet from 'ethereumjs-wallet'
import { readFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { IdentityType } from '../../service/identity/types'
import { expectFile, getFieldOrNull, isPrivateKey, normalizePrivateKey } from '../../utils'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { createAndRunSpinner } from '../../utils/spinner'
import { RootCommand } from '../root-command'
import { VerbosityLevel } from '../root-command/command-log'

export class Import extends RootCommand implements LeafCommand {
  public readonly name = 'import'

  public readonly description = 'Import private key or V3 wallet as a new identity'

  @Argument({
    key: 'resource',
    required: true,
    description: 'Private key string or path to file with V3 Wallet or private key',
    autocompletePath: true,
  })
  public resource!: string

  @Option({ key: 'name', alias: 'i', description: 'Name of the identity to be saved as', required: true })
  public identityName!: string

  @Option({ key: 'password', alias: 'P', description: 'Password for the V3 wallet' })
  public password!: string

  public async run(): Promise<void> {
    await super.init()

    if (this.commandConfig.config.identities[this.identityName]) {
      throw new CommandLineError(Message.identityNameConflict(this.identityName))
    }

    if (isPrivateKey(this.resource)) {
      await this.runImportOnPrivateKey()
    } else {
      expectFile(this.resource)
      this.resource = readFileSync(this.resource, 'utf-8')

      if (isPrivateKey(this.resource)) {
        await this.runImportOnPrivateKey()
      } else {
        if (!this.password) {
          this.console.log(Message.optionNotDefined('password'))
          this.password = await this.console.askForPassword(Message.existingV3Password())
        }
        const spinner = createAndRunSpinner('Decrypting V3 wallet...', this.verbosity)
        try {
          const wallet: Wallet = await this.decryptV3Wallet(this.resource)

          spinner.text = 'Importing V3 wallet...'
          await this.saveWallet(wallet)
        } finally {
          spinner.stop()
        }
        this.console.log(`V3 Wallet imported as identity '${this.identityName}' successfully`)
      }
    }
  }

  private async runImportOnPrivateKey(): Promise<void> {
    if (await this.shouldConvertToV3Wallet()) {
      await this.convertPrivateKeyToV3Wallet()
    } else {
      const data = {
        wallet: {
          privateKey: this.resource,
        },
        identityType: IdentityType.simple,
      }

      if (!this.commandConfig.saveIdentity(this.identityName, data)) {
        throw new CommandLineError(Message.identityNameConflictOption(this.identityName))
      }
      this.console.log(`Private key imported as identity '${this.identityName}' successfully`)
    }
  }

  private async decryptV3Wallet(data: string): Promise<Wallet> {
    try {
      const wallet: Wallet = await Wallet.fromV3(data, this.password)

      return wallet
    } catch (error: unknown) {
      const message: string = getFieldOrNull(error, 'message') || 'unknown error'
      throw new CommandLineError(`Failed to decrypt wallet: ${message}`)
    }
  }

  private async convertPrivateKeyToV3Wallet(): Promise<void> {
    if (!this.password) {
      this.console.log(Message.optionNotDefined('password'))
      this.password = await this.console.askForPasswordWithConfirmation(
        Message.newV3Password(),
        Message.newV3PasswordConfirmation(),
      )
    }
    const wallet = Wallet.fromPrivateKey(Buffer.from(normalizePrivateKey(this.resource), 'hex'))
    await this.saveWallet(wallet)
    this.console.log(`V3 Wallet imported as identity '${this.identityName}' successfully`)
  }

  private async saveWallet(wallet: Wallet): Promise<void> {
    const data = {
      wallet: await wallet.toV3(this.password),
      identityType: IdentityType.v3,
    }

    if (!this.commandConfig.saveIdentity(this.identityName, data)) {
      throw new CommandLineError(Message.identityNameConflict(this.identityName))
    }
  }

  private async shouldConvertToV3Wallet(): Promise<boolean> {
    if (this.yes) {
      return false
    }

    if (this.password) {
      return true
    }

    if (this.verbosity !== VerbosityLevel.Quiet) {
      const answer = await this.console.confirmAndDelete('Convert private key to a secure V3 wallet?')

      return answer
    }

    return false
  }
}
