import { RootCommand } from '../../command/root-command'
import { Config } from '../../command/root-command/command-config'

export interface ConfigOption {
  optionKey: string
  propertyKey: keyof Config & keyof RootCommand
}
