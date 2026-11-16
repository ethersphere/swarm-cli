import { tokenize } from './tokenize'
import { Argument, Command, Group } from './type'

type Entry = Command | Group
type TokenContext = ReturnType<typeof tokenize>
type PathResolver = (word: string) => Promise<string[]>

function findCommand(name: string, entries: Entry[]): Command | undefined {
  const item = entries.find(entry => entry.fullPath === name)

  return item instanceof Command ? item : undefined
}

function isOptionSpecified(context: TokenContext, option: Argument): boolean {
  if (context.argv.includes('--' + option.key) && context.token !== '--' + option.key) {
    return true
  }

  return Boolean(option.alias && context.argv.includes('-' + option.alias) && context.token !== '-' + option.alias)
}

function findMatchingOptions(context: TokenContext, options: Argument[]): string[] {
  if (['', '-', '--'].includes(context.token)) {
    return options.map(option => '--' + option.key)
  }

  if (context.token.startsWith('--')) {
    return options.filter(option => option.key.startsWith(context.token.slice(2))).map(option => '--' + option.key)
  }

  if (context.token.startsWith('-')) {
    return options
      .filter(option => option.alias && option.alias.startsWith(context.token.slice(1)))
      .map(option => '-' + option.alias)
  }

  return []
}

function getMatchingPartLength(a: string, b: string): number {
  const length = Math.min(a.length, b.length)
  let i = 0
  for (; i < length; i++) {
    if (a[i] !== b[i]) {
      break
    }
  }

  return i
}

function flatten(results: Entry[], node: Entry): void {
  results.push(node)

  if (node instanceof Group) {
    node.groups.forEach(group => flatten(results, group))
    node.commands.forEach(command => flatten(results, command))
  }
}

function findOptionForWord(word: string | undefined, options: Argument[]): Argument | undefined {
  if (word?.startsWith('--')) {
    return options.find(option => option.key === word.slice(2))
  }

  if (word?.startsWith('-')) {
    return options.find(option => option.alias === word.slice(1))
  }

  return undefined
}

function getPreviousOption(context: TokenContext, options: Argument[]): Argument | undefined {
  const word = context.opensNext ? context.argv[context.argv.length - 1] : context.argv[context.argv.length - 2]

  return findOptionForWord(word, options)
}

function isBooleanTrueLike(word: string | undefined): boolean {
  return Boolean(word && 'true'.startsWith(word))
}

function isBooleanFalseLike(word: string | undefined): boolean {
  return Boolean(word && 'false'.startsWith(word))
}

function getPositionalArgument(
  command: Command,
  context: TokenContext,
  allArguments: Argument[],
  globalOptions: Argument[],
): Argument | undefined {
  const commandWords = command.fullPath.split(' ').length

  if (commandWords === context.argv.length && context.opensNext) {
    return allArguments[0]
  }
  let argumentIndex = -1
  for (let i = commandWords; i < context.argv.length; i++) {
    const word = context.argv[i]
    const next = context.argv[i + 1]
    const option = findOptionForWord(word, globalOptions)

    if (!option) {
      argumentIndex++
    } else if (option.type !== 'boolean' || isBooleanTrueLike(next) || isBooleanFalseLike(next)) {
      i++
    }
  }

  if (context.opensNext) {
    argumentIndex++
  }

  return allArguments[argumentIndex]
}

async function handleMatch(
  context: TokenContext,
  match: Command,
  entries: Entry[],
  globalOptions: Argument[],
  pathResolver: PathResolver,
): Promise<string[]> {
  const sibling = match.sibling ? findCommand(match.sibling, entries) : undefined
  const options = [...match.options, ...(sibling?.options ?? []), ...globalOptions]
  const allArguments = [...match.arguments, ...(sibling?.arguments ?? [])]
  const previousOption = getPreviousOption(context, options)

  if (previousOption && previousOption.type === 'boolean' && context.token) {
    if (isBooleanTrueLike(context.token)) {
      return ['true']
    }

    if (isBooleanFalseLike(context.token)) {
      return ['false']
    }
  }

  if (previousOption && previousOption.autocompletePath) {
    return pathResolver(context.token)
  }

  if (!context.token.startsWith('-')) {
    const positionalArgument = getPositionalArgument(match, context, allArguments, globalOptions)

    if (positionalArgument && positionalArgument.autocompletePath) {
      return pathResolver(context.token)
    }
  }
  const missingOptions = options.filter(option => !isOptionSpecified(context, option))

  return findMatchingOptions(context, missingOptions)
}

function trail(suggestions: string[], trailing: string): string[] {
  if (!trailing || !suggestions.length) {
    return suggestions
  }

  return suggestions.map(suggestion => (suggestion.endsWith('/') ? suggestion : suggestion + trailing))
}

export async function suggest(
  line: string,
  offset: number,
  entries: Entry[],
  globalOptions: Argument[],
  pathResolver: PathResolver,
  trailing: string,
): Promise<string[]> {
  const context = tokenize(line, offset)

  if (!context.argv.length) {
    return trail(
      entries.filter(entry => entry.depth === 0).map(x => x.key),
      trailing,
    )
  }
  const normalLine = context.argv.join(' ') + (context.opensNext ? ' ' : '')
  const nodes: Entry[] = []
  for (const entry of entries) {
    flatten(nodes, entry)
  }
  const match = nodes.find(
    (node): node is Command => node instanceof Command && normalLine.startsWith(node.fullPath + ' '),
  )

  if (match) {
    return trail(await handleMatch(context, match, entries, globalOptions, pathResolver), trailing)
  }

  if (!nodes.length) {
    return []
  }
  const scored = nodes.map(node => ({ node, length: getMatchingPartLength(normalLine, node.fullPath) }))
  const longestMatchingPartLength = Math.max(...scored.map(x => x.length))

  if (!longestMatchingPartLength) {
    return []
  }
  const substringMatches = scored.filter(x => x.length === longestMatchingPartLength).map(x => x.node)
  const lowestDepth = Math.min(...substringMatches.map(x => x.depth))
  const matches = substringMatches.filter(node => node.depth === lowestDepth)

  return trail(
    matches.map(x => x.key),
    trailing,
  )
}
