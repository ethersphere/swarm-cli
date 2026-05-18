import chalk from 'chalk'
import QRCode from 'qrcode'
import { CommandLog } from '../command/root-command/command-log'

export async function printQRCodeWithLabel(data: string, label: string, target: CommandLog): Promise<void> {
  target.log(chalk.green.bold(`${label}:\n`))
  target.log(await QRCode.toString(data, { type: 'terminal', small: true }))
}
