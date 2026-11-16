import { Application, Argument, Command, Group, Printer } from './type'

const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const WHITE = '\x1b[37m'
const RED_BACKGROUND = '\x1b[41m'
const RESET = '\x1b[0m'
const EXTRA_SPACE = 3

export function createDefaultApplication(): Application {
  return {
    name: 'Node.js CLI',
    command: 'node',
    version: '1.0.0',
    description: 'Powered by open source technologies',
  }
}

export function getHeadlineMessage(application: Application): string {
  return application.name + ' ' + application.version + ' - ' + application.description
}

export function getGroupInfoMessage(application: Application): string {
  return "Run '" + application.command + " GROUP --help' to see available commands in a group"
}

function getCommandInfoMessage(application: Application): string {
  return "Run '" + application.command + " COMMAND --help' for more information on a command"
}

export function createDefaultPrinter(): Printer {
  const style = (prefix: string) => (string: string) => process.stdout.isTTY ? prefix + string + RESET : string
  const formatDim = style(DIM)
  const formatImportant = style(BOLD)
  const formatError = style(BOLD + WHITE + RED_BACKGROUND)
  const print = (text: string) => process.stdout.write(text + '\n')

  return {
    print,
    printError: text => print(formatError(text)),
    printHeading: text => print(formatImportant('█ ' + text)),
    formatDim,
    formatImportant,
  }
}

function getCliWidth(): number {
  return process.stdout.columns || 100
}

function getLongestKey(items: (Command | Group | Argument)[]): number {
  return items.reduce((x, i) => {
    const length = ('fullPath' in i ? i.fullPath : i.key).length

    return length > x ? length : x
  }, 0)
}

function getArgumentStringForCommandUsage(commandArguments: Argument[]): string {
  if (!commandArguments.length) {
    return ' '
  }

  return ' ' + commandArguments.map(x => '<' + x.key + '>').join(' ') + ' '
}

export function printUsage(
  printer: Printer,
  application: Application,
  group?: Group,
  command?: Command,
  commandArguments?: Argument[],
): void {
  printer.printHeading('Usage:')
  printer.print('')

  if (command) {
    printer.print(
      application.command +
        ' ' +
        command.fullPath +
        getArgumentStringForCommandUsage(commandArguments || []) +
        '[OPTIONS]',
    )
    printer.print('')
    printer.print(command.description)
  } else if (group) {
    printer.print(application.command + ' ' + group.fullPath + ' COMMAND [OPTIONS]')
    printer.print('')
    printer.print(group.description)
  } else {
    printer.print(application.command + ' COMMAND [OPTIONS]')
  }
}

function printCommand(printer: Printer, command: Command, padLength: number): void {
  if (command.alias) {
    printNameMetaDescription(
      printer,
      command.fullPath.padEnd(padLength + EXTRA_SPACE),
      '[alias: ' + command.alias + ']',
      command.description,
    )
  } else {
    printer.print(printer.formatImportant(command.fullPath.padEnd(padLength + EXTRA_SPACE)) + command.description)
  }
}

export function printCommands(printer: Printer, application: Application, commands: Command[]): void {
  if (commands.length) {
    const longest = getLongestKey(commands)
    printer.printHeading('Available Commands:')
    printer.print('')
    for (const command of commands) {
      printCommand(printer, command, longest)
    }
    printer.print('')
    printer.print(printer.formatDim(getCommandInfoMessage(application)))
    printer.print('')
  }
}

export function printGroups(printer: Printer, application: Application, groups: Group[]): void {
  if (groups.length) {
    const longest = getLongestKey(groups)
    printer.printHeading('Available Groups:')
    printer.print('')
    for (const group of groups) {
      printer.print(printer.formatImportant(group.key.padEnd(longest + EXTRA_SPACE)) + group.description)
    }
    printer.print('')
    printer.print(printer.formatDim(getGroupInfoMessage(application)))
    printer.print('')
  }
}

function printNameMetaDescription(printer: Printer, name: string, meta: string, description: string): void {
  const columns = getCliWidth()
  const fullLine = name + description + meta
  const nameAndMeta = name + meta
  const lineWithoutMeta = name + description

  if (fullLine.length < columns) {
    printer.print(printer.formatImportant(name) + description + meta.padStart(columns - lineWithoutMeta.length))
  } else if (nameAndMeta.length < columns) {
    printer.print(printer.formatImportant(name) + meta.padStart(columns - name.length))
    printer.print(description)
    printer.print('')
  } else {
    printer.print(printer.formatImportant(name))
    printer.print(meta)
    printer.print(description)
    printer.print('')
  }
}

function printOption(printer: Printer, option: Argument, padLength: number): void {
  const aliasString = option.alias ? '-' + option.alias : '  '
  const typeString = `[${option.type || 'string'}]`
  const defaultString =
    option.default !== undefined ? '[default ' + String(option.defaultDescription || option.default) + ']' : ''
  let requiredString = ''

  if (option.required && typeof option.required !== 'boolean') {
    requiredString =
      'when' in option.required
        ? `[required when ${option.required.when}]`
        : `[required unless ${option.required.unless}]`
  }
  const name = `${aliasString} --${option.key}`.padEnd(padLength)
  const meta = `${requiredString}${typeString}${defaultString}`
  printNameMetaDescription(printer, name, meta, option.description)
}

function printArgument(printer: Printer, argument: Argument, maxArgumentKeyLength: number): void {
  const requiredString = argument.required ? 'required ' : ''
  const meta = `[${requiredString}${argument.type || 'string'}]`
  printNameMetaDescription(printer, argument.key.padEnd(maxArgumentKeyLength + EXTRA_SPACE), meta, argument.description)
}

function printOptionFamily(printer: Printer, heading: string, items: Argument[]): void {
  const length = getLongestKey(items) + 5 + EXTRA_SPACE
  printer.printHeading(heading + ':')
  printer.print('')
  const seen = new Set<string>()
  const xors: string[] = []
  for (const option of items) {
    if (seen.has(option.key)) {
      continue
    }
    seen.add(option.key)

    if (option.conflicts) {
      const order = option.key.localeCompare(option.conflicts)
      const text =
        order === -1 ? `[${option.key}] or [${option.conflicts}]` : `[${option.conflicts}] or [${option.key}]`

      if (!xors.includes(text)) {
        xors.push(text)
      }
    }
    printOption(printer, option, length)
  }

  if (xors.length) {
    printer.print('')
    printer.print('Only one is required: ' + xors.join(', '))
  }
  printer.print('')
}

export function maybePrintOptionFamily(printer: Printer, heading: string, items: Argument[]): void {
  if (items.length) {
    printOptionFamily(printer, heading, items)
  }
}

export function printCommandUsage(
  printer: Printer,
  application: Application,
  command: Command,
  options: Argument[],
  commandArguments: Argument[],
): void {
  const requiredOptions = options.filter(option => !option.global && option.required)
  const optionalOptions = options.filter(option => !option.global && !option.required)
  const globalOptions = options.filter(option => option.global)
  printUsage(printer, application, undefined, command, commandArguments)
  printer.print('')
  const maxArgumentKeyLength = getLongestKey(commandArguments)

  if (commandArguments.length) {
    printer.printHeading('Arguments:')
    printer.print('')
    for (const argument of commandArguments) {
      printArgument(printer, argument, maxArgumentKeyLength)
    }
    printer.print('')
  }
  maybePrintOptionFamily(printer, 'Required Options', requiredOptions)
  maybePrintOptionFamily(printer, 'Options', optionalOptions)
  maybePrintOptionFamily(printer, 'Global Options', globalOptions)
}
