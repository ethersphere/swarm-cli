import { Bee, Topic } from '@ethersphere/bee-js'
import { statSync } from 'fs'
import { exit } from 'process'
import { CommandLog } from '../command/root-command/command-log'

/**
 * Sleep for N miliseconds
 *
 * @param ms Number of miliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(() => resolve(), ms))
}

export function fileExists(path: string): boolean {
  try {
    const stat = statSync(path)

    return stat.isFile()
  } catch {
    return false
  }
}

export function isGateway(url: string): boolean {
  return url.includes('gateway.ethswarm.org')
}

export function enforceValidHexTopic(console: CommandLog, topic: string): void {
  const hasCorrectLength = topic.startsWith('0x') ? topic.length === 66 : topic.length === 64
  const hasCorrectPattern = new RegExp(/^(0x)?[A-Fa-f0-9]+$/g).test(topic)

  if (!hasCorrectLength || !hasCorrectPattern) {
    console.error('Error parsing topic!')
    console.log('You can have it hashed to 32 bytes by passing the --hash-topic option.')
    console.log('To provide the 32 bytes, please specify it in lower case hexadecimal format.')
    console.log('The 0x prefix may be omitted.')
    exit(1)
  }
}

export function getTopic(bee: Bee, console: CommandLog, topic: string, hash: boolean): string | Topic {
  if (hash) {
    return bee.makeFeedTopic(topic)
  }
  enforceValidHexTopic(console, topic)

  return topic.toLowerCase()
}
