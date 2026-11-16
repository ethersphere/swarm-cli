import { Argument, Command, Group } from './type'

export function findLongOption(options: Argument[], string: string): Argument | undefined {
  return options.find(option => option.key === string)
}

function findShortOption(options: Argument[], string: string): Argument | undefined {
  return options.find(option => option.alias === string)
}

export function findOption(options: Argument[], string: string): Argument | undefined {
  return string.startsWith('--') ? findLongOption(options, string.slice(2)) : findShortOption(options, string.slice(1))
}

export function isOption(string: string): boolean {
  return string.startsWith('-') && !/^-\d+$/.test(string)
}

export function isOptionPassed(argv: string[], option: Argument): boolean {
  return argv.includes('--' + option.key) || argv.includes('-' + option.alias)
}

export function findCommandByFullPath(groups: Group[], commands: Command[], fullPath: string): Command | undefined {
  const items = [...commands, ...groups.flatMap(group => group.commands)]

  return items.find(item => item.fullPath === fullPath)
}

function arrayBeginsWith(array: string[], text: string): boolean {
  const words = text.split(' ')

  if (words.length > array.length) {
    return false
  }
  for (let i = 0; i < words.length; i++) {
    if (array[i] !== words[i]) {
      return false
    }
  }

  return true
}

export function findGroupAndCommand(
  argv: string[],
  groups: Group[],
  commands: Command[],
  group?: Group,
): { group?: Group | undefined; command?: Command } {
  const groupPath = group ? group.fullPath + ' ' : ''
  for (const command of commands) {
    if (
      arrayBeginsWith(argv, groupPath + command.key) ||
      (command.alias && arrayBeginsWith(argv, groupPath + command.alias))
    ) {
      return { group, command }
    }
  }
  for (const group of groups) {
    if (arrayBeginsWith(argv, group.fullPath)) {
      const result = findGroupAndCommand(argv, group.groups, group.commands, group)

      if (result.group) {
        return result
      }
    }
  }

  return { group }
}
