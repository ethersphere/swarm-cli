import Wallet from 'ethereumjs-wallet'
import { hexToBytes } from '../../utils/hex'
import { Identity, IdentityType, IdentityWallet, SimpleWallet, V3Keystore } from './types'

export function getPrintableIdentityType(identityType: IdentityType): string {
  switch (identityType) {
    case IdentityType.simple:
      return 'only keypair'
    case IdentityType.v3:
      return 'v3 keystore'
    default:
      throw new Error(`IdentityType '${identityType}' is not known.`)
  }
}

export function isSimpleWallet(wallet: IdentityWallet, identityType: IdentityType): wallet is SimpleWallet {
  if (identityType === IdentityType.simple) return true

  return false
}

export function isV3Wallet(wallet: IdentityWallet, identityType: IdentityType): wallet is V3Keystore {
  if (identityType === IdentityType.v3) return true

  return false
}

export function getSimpleWallet(wallet: SimpleWallet): Wallet {
  const privateKeyBytes = hexToBytes(wallet.privateKey)

  return new Wallet(Buffer.from(privateKeyBytes))
}

export function getV3Wallet(wallet: V3Keystore, password: string): Promise<Wallet> {
  return Wallet.fromV3(wallet, password)
}

/** Used when identity's wallet is not sure which type */
export function getWalletFromIdentity(identity: Identity, password?: string): Promise<Wallet> {
  const { wallet, identityType } = identity

  if (isSimpleWallet(wallet, identityType)) {
    return new Promise(resolve => resolve(getSimpleWallet(wallet)))
  } else if (isV3Wallet(wallet, identityType)) {
    if (!password) throw new Error(`There is no  password passed for V3 wallet initialization`)

    return getV3Wallet(wallet, password)
  }

  throw new Error(`Wrong identity 'typeOfWallet' value: ${identity.identityType}`)
}
