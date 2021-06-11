import { IOption } from 'furious-commander'

export const stampProperties: IOption = {
  key: 'stamp',
  type: 'hex-string',
  length: 64,
  description: 'ID of the postage stamp to use',
  required: { when: 'quiet' },
}

export const topicProperties: IOption = {
  key: 'topic',
  type: 'hex-string',
  alias: 't',
  description: '32-byte long identifier in hexadecimal format',
  default: '0'.repeat(64),
  defaultDescription: 'all zeroes',
  conflicts: 'topic-string',
}

export const topicStringProperties: IOption = {
  key: 'topic-string',
  alias: 'T',
  description: 'Construct the topic from human readable strings',
  conflicts: 'topic',
}
