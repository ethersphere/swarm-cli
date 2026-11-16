export type CommandConstructor = {
  new (): LeafCommand | GroupCommand
}

interface BaseCommand {
  readonly name: string
  readonly description: string
  readonly alias?: string
}

export interface GroupCommand extends BaseCommand {
  subCommandClasses: CommandConstructor[]
}

export interface LeafCommand extends BaseCommand {
  run(): void | Promise<void>
}

export interface Argument<T = unknown> {
  key: string
  description: string
  type?: 'string' | 'boolean' | 'number' | 'bigint' | 'hex-string' | 'decimal-string' | 'enum'
  enum?: string[]
  required?: boolean | { when: string } | { unless: string }
  conflicts?: string
  default?: T
  defaultDescription?: string
  alias?: string
  envKey?: string
  minimum?: number | bigint
  maximum?: number | bigint
  length?: number
  minimumLength?: number
  maximumLength?: number
  oddLength?: boolean
  noErrors?: boolean
  autocompletePath?: boolean
  handler?: () => void | Promise<void>
  global?: boolean
  array?: boolean
  validate?: (value: T, context: ParsedContext) => string[]
}

function prependName(group: Group, name: string): void {
  group.fullPath = name + ' ' + group.fullPath
  group.depth++
  for (const child of group.groups) {
    prependName(child, name)
  }
  for (const child of group.commands) {
    child.depth++
    child.fullPath = name + ' ' + child.fullPath
  }
}

export class Group {
  public groups: Group[] = []
  public commands: Command[] = []
  public fullPath: string
  public depth = 0

  constructor(public key: string, public description: string) {
    this.fullPath = key
  }

  withGroup(group: Group): Group {
    this.groups.push(group)
    prependName(group, this.fullPath)

    return this
  }

  withCommand(command: Command): Group {
    this.commands.push(command)
    command.depth++
    command.fullPath = this.key + ' ' + command.fullPath

    return this
  }
}

export class Command {
  public sibling?: string | undefined
  public alias?: string | undefined
  public options: Argument[] = []
  public arguments: Argument[] = []
  public fullPath: string
  public depth = 0

  constructor(
    public key: string,
    public description: string,
    public leafCommand: LeafCommand,
    settings?: { sibling?: string | undefined; alias?: string | undefined },
  ) {
    if (settings) {
      this.sibling = settings.sibling
      this.alias = settings.alias
    }
    this.fullPath = key
  }

  withOption(x: Argument): Command {
    this.options.push(x)

    return this
  }

  withPositional(x: Argument): Command {
    this.arguments.push(x)

    return this
  }
}

export type ParsedCommand = {
  command: Command
  arguments: Record<string, unknown>
  options: Record<string, unknown>
}

export type Sourcemap = Record<string, 'default' | 'env' | 'explicit'>

export interface Context {
  exitReason?: string
  command?: Command | undefined
  group?: Group | undefined
  options: Record<string, unknown>
  arguments: Record<string, unknown>
  sourcemap: Sourcemap
  sibling?: ParsedCommand
  argumentIndex: number
}

export type ParsedContext = Context & {
  command: Command
}

export interface Application {
  name: string
  command: string
  version: string
  description: string
}

export interface Parser {
  suggest(line: string, offset: number, trailing: string): Promise<string[]>
  parse(argv: string[]): Promise<string | Context | { exitReason: string }>
  addGroup(group: Group): void
  addCommand(command: Command): void
  addGlobalOption(option: Argument): void
}

export interface Printer {
  print(text: string): void
  printError(text: string): void
  printHeading(text: string): void
  formatDim(text: string): string
  formatImportant(text: string): string
}
