import { Application } from './application'
import { addAutocompleteCapabilities, maybeAutocomplete } from './autocomplete'
import { Command, InitedCommand, isGroupCommand } from './command'
import { findFirstAggregation, getArgument, getExternalOption, getOption } from './decorators'
import {
  Argument as ArgumentDefinition,
  Command as ParserCommand,
  CommandConstructor,
  Context,
  createParser,
  Group,
  GroupCommand,
  LeafCommand,
  Parser,
  Sourcemap,
} from '../command-parser'
import { createDefaultPrinter, Printer } from './printer'

let sourcemap: Sourcemap = {}

interface CliOptions {
  rootCommandClasses: CommandConstructor[]
  optionParameters?: ArgumentDefinition<unknown>[]
  testArguments?: string[]
  printer?: Printer
  application?: Application
  errorHandler?: (error: unknown) => void | Promise<void>
}

interface CommandDecoratorData {
  commandOptions: ArgumentDefinition[]
  commandArguments: ArgumentDefinition[]
}

function collectCommandDecoratorData(target: Command, data: CommandDecoratorData): void {
  // eslint-disable-next-line guard-for-in
  for (const instanceKey in target) {
    const option = getOption(target, instanceKey)

    if (option) {
      data.commandOptions.push(option)
      continue
    }
    const argument = getArgument(target, instanceKey)

    if (argument) {
      data.commandArguments.push(argument)
    }
  }
}

function initCommandFields(target: LeafCommand, values: Record<string, unknown>): void {
  // eslint-disable-next-line guard-for-in
  for (const field in target) {
    const key = getOption(target, field)?.key || getExternalOption(target, field) || getArgument(target, field)?.key

    if (key) {
      Reflect.set(target, field, values[key])
    }
  }
}

class CommandBuilder {
  public initedCommands: InitedCommand[] = []
  public runnable?: LeafCommand
  public context!: Context | string | { exitReason: string }

  constructor(public parser: Parser) {}

  public async initCommandClasses(argv: string[], rootCommandClasses: CommandConstructor[]): Promise<void> {
    this.initedCommands = rootCommandClasses.map(x => this.instantiateCommandTree(x))
    this.initedCommands.forEach(x => this.declareCommand(x))

    await maybeAutocomplete(argv, this.parser)

    this.context = await this.parser.parse(argv)

    if (typeof this.context === 'string' || 'exitReason' in this.context || !this.context.command) {
      return
    }

    sourcemap = this.context.sourcemap
    const command = this.context.command.leafCommand
    initCommandFields(command, { ...this.context.options, ...this.context.arguments })

    if (this.context.sibling) {
      const aggregation = findFirstAggregation(command)
      const siblingCommand = this.context.sibling.command.leafCommand

      if (aggregation) {
        Reflect.set(command, aggregation.property, siblingCommand)
      }
      initCommandFields(siblingCommand, { ...this.context.sibling.options, ...this.context.sibling.arguments })
    }

    this.runnable = command
  }

  private createGroup(
    command: GroupCommand,
    commandArguments: ArgumentDefinition[],
    commandOptions: ArgumentDefinition[],
  ): Group {
    const group = new Group(command.name, command.description)
    collectCommandDecoratorData(command, { commandArguments, commandOptions })
    for (const SubcommandClass of command.subCommandClasses) {
      const initedSubcommand = new SubcommandClass()

      if (isGroupCommand(initedSubcommand)) {
        group.withGroup(this.createGroup(initedSubcommand, [...commandArguments], [...commandOptions]))
      } else {
        group.withCommand(this.createCommand(initedSubcommand, [...commandOptions], [...commandArguments]))
      }
    }

    return group
  }

  private declareCommand(initedCommand: InitedCommand): void {
    const commandInstance = initedCommand.command

    if (isGroupCommand(commandInstance)) {
      this.parser.addGroup(this.createGroup(commandInstance, [], []))
    } else {
      this.parser.addCommand(this.createCommand(commandInstance, [], []))
    }
  }

  private instantiateCommandTree(commandClass: CommandConstructor): InitedCommand {
    const command = new commandClass()
    const subCommands = isGroupCommand(command)
      ? command.subCommandClasses.map(x => this.instantiateCommandTree(x))
      : []

    return { command, subCommands }
  }

  private createCommand(
    command: LeafCommand,
    commandOptions: ArgumentDefinition[],
    commandArguments: ArgumentDefinition[],
  ): ParserCommand {
    collectCommandDecoratorData(command, { commandArguments, commandOptions })
    const aggregation = findFirstAggregation(command)
    const commandDefinition = new ParserCommand(command.name, command.description, command, {
      sibling: aggregation?.command,
      alias: command.alias,
    })
    for (const option of commandOptions) {
      commandDefinition.withOption(option)
    }
    for (const argument of commandArguments) {
      commandDefinition.withPositional(argument)
    }

    return commandDefinition
  }
}

export async function cli(options: CliOptions): Promise<CommandBuilder> {
  const { rootCommandClasses, optionParameters, testArguments, application } = options
  const printer = options.printer || createDefaultPrinter()
  const parser = createParser({ printer, application })

  if (application) {
    addAutocompleteCapabilities(parser, application)
  }

  for (const option of optionParameters ?? []) {
    parser.addGlobalOption(option)
  }
  const builder = new CommandBuilder(parser)
  await builder.initCommandClasses(testArguments || process.argv.slice(2), rootCommandClasses)

  if (builder.runnable) {
    try {
      await builder.runnable.run()
    } catch (error: unknown) {
      if (options.errorHandler) {
        await options.errorHandler(error)

        return builder
      }
      printer.printHeading(printer.formatImportant(printer.getGenericErrorMessage()))

      if (typeof error === 'object' && error) {
        printer.print('')
        printer.printError(Reflect.get(error, 'message'))
      }

      if (!process.exitCode) {
        process.exitCode = 1
      }
    }
  }

  return builder
}

export { Aggregation, Argument, ExternalOption, Option } from './decorators'
export type { Application } from './application'
export type { Printer } from './printer'
export type { Command, InitedCommand, GroupCommand, LeafCommand, Sourcemap }
export type { Context, ParsedContext } from '../command-parser'

export type IOption<T = unknown> = ArgumentDefinition<T>
export type IArgument<T = unknown> = ArgumentDefinition<T>

export const Utils = {
  isGroupCommand,
  getSourcemap: (): Sourcemap => sourcemap,
}
