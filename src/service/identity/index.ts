import Wallet from 'ethereumjs-wallet'
import { CommandConfig } from '../../command/root-command/command-config'
import { CommandLog } from '../../command/root-command/command-log'
import { CommandLineError } from '../../utils/error'
import { hexToBytes } from '../../utils/hex'
import { Message } from '../../utils/message'
import { Identity, IdentityType, IdentityWallet, SimpleWallet, V3Keystore } from './types'

export function getPrintableIdentityType(type: IdentityType): string {
  switch (type) {
    case IdentityType.simple:
      return 'Private Key'
    case IdentityType.v3:
      return 'V3 Wallet'
    default:
      return 'Unknown'
  }
}

export function isSimpleWallet(wallet: IdentityWallet, identityType: IdentityType): wallet is SimpleWallet {
  return identityType === IdentityType.simple
}

export function isV3Wallet(wallet: IdentityWallet, identityType: IdentityType): wallet is V3Keystore {
  return identityType === IdentityType.v3
}

export function getSimpleWallet(wallet: SimpleWallet): Wallet {
  const privateKeyBytes = hexToBytes(wallet.privateKey)

  return new Wallet(Buffer.from(privateKeyBytes))
}

export function getV3Wallet(wallet: V3Keystore, password: string): Promise<Wallet> {
  return Wallet.fromV3(wallet, password)
}

/** Used when identity's wallet is not sure which type */
export async function getWalletFromIdentity(
  console: CommandLog,
  quiet: boolean,
  identity: Identity,
  password?: string,
): Promise<Wallet> {
  const { wallet, identityType } = identity

  if (isSimpleWallet(wallet, identityType)) {
    return getSimpleWallet(wallet)
  } else if (isV3Wallet(wallet, identityType)) {
    if (!password) {
      if (quiet) {
        throw new CommandLineError('Password must be passed with the --password option in quiet mode')
      }
      password = await console.askForPassword('Please provide the password for this V3 Wallet')
    }

    return getV3Wallet(wallet, password)
  }

  throw new CommandLineError(`Wrong identity 'typeOfWallet' value: ${identity.identityType}`)
}

export async function pickIdentity(commandConfig: CommandConfig, console: CommandLog): Promise<string> {
  const names = Object.keys(commandConfig.config.identities)

  if (!names.length) {
    throw new CommandLineError(Message.noIdentity())
  }

  const name = await console.promptList(names, 'Please select an identity for this action')

  return name
}
