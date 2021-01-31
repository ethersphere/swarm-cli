import { V3Keystore, SimpleWallet } from './wallet'

export type IdentityWallet = V3Keystore | SimpleWallet

export enum IdentityType {
  simple,
  v3,
}

export interface Identity {
  wallet: IdentityWallet
  identityType: IdentityType
}

export const IdentityTypeArray = Object.values(IdentityType).filter(String)
