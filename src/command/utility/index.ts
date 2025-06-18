import { Wallet } from '@ethereumjs/wallet'
import { readFile } from 'fs/promises'
import { GroupCommand } from 'furious-commander'
import { fileExists } from '../../utils'
import { CommandLog } from '../root-command/command-log'
import { Cid } from './cid'
import { CreateBatch } from './create-batch'
import { GetBee } from './get-bee'
import { Lock } from './lock'
import { Rchash } from './rchash'
import { Redeem } from './redeem'
import { Unlock } from './unlock'

export class Utility implements GroupCommand {
  public readonly name = 'utility'

  public readonly description = 'Utility commands related to Swarm and wallets'

  public subCommandClasses = [Cid, Lock, Unlock, GetBee, Redeem, CreateBatch, Rchash]
}

export async function createWallet(pathOrPrivateKey: string, console: CommandLog): Promise<Wallet> {
  if (fileExists(pathOrPrivateKey)) {
    const json = await readFile(pathOrPrivateKey, 'utf8')
    const password = await console.askForPassword('Enter password to decrypt key file')
    const wallet = await Wallet.fromV3(json, password)

    return wallet
  }

  if (pathOrPrivateKey.startsWith('0x')) {
    pathOrPrivateKey = pathOrPrivateKey.slice(2)
  }

  return new Wallet(Buffer.from(pathOrPrivateKey, 'hex'))
}
