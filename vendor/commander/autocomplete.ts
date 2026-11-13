import { promises as fs } from 'fs'
import { EOL } from 'os'
import { exit } from 'process'
import { Application } from './application'
import { Command, detectShell, generateCompletion, getShellPaths, Parser, Shell } from '../command-parser'

const AUTOCOMPLETE_FLAG = '--compgen'
const FISH_FLAG = '--compfish'

interface CompletionInfo {
  shell: Shell
  possibleShellPaths: string[] | null
  path: string | null
  script: string | null
}

export function addAutocompleteCapabilities(parser: Parser, application: Application): void {
  if (application.autocompletion === 'fromOption') {
    parser.addGlobalOption({
      key: 'generate-completion',
      description: 'Generate autocomplete script',
      type: 'boolean',
      handler: async () => generateAutocompletion(application.command),
    })
    parser.addGlobalOption({
      key: 'install-completion',
      description: 'Install autocomplete script',
      type: 'boolean',
      handler: async () => installAutocompletion(application.command),
    })
  } else if (application.autocompletion === 'fromCommand') {
    parser.addCommand(
      new Command('generate-completion', 'Generate autocomplete script', {
        name: 'generate-completion',
        description: 'Generate autocomplete script',
        run: async () => generateAutocompletion(application.command),
      }),
    )
    parser.addCommand(
      new Command('install-completion', 'Install autocomplete script', {
        name: 'install-completion',
        description: 'Install autocomplete script',
        run: async () => installAutocompletion(application.command),
      }),
    )
  }
}

export async function maybeAutocomplete(argv: string[], parser: Parser): Promise<void> {
  const index = argv.findIndex(x => x === AUTOCOMPLETE_FLAG)

  if (index === -1) {
    return
  }
  const isFish = argv.includes(FISH_FLAG)
  const suggestions = await parser.suggest(argv[index + 1] ?? '', 1, isFish ? '' : ' ')
  for (const suggestion of suggestions) {
    process.stdout.write(suggestion + EOL)
  }
  exit(0)
}

async function generateAutocompletion(command: string): Promise<void> {
  const completion = await getCompletionInfo(command, false)
  process.stdout.write('Your shell is: ' + completion.shell + EOL)

  if (completion.path) {
    process.stdout.write('Found configuration file path: ' + completion.path + EOL)
  } else {
    process.stdout.write('Could not locate your shell configuration path!' + EOL)
  }
  process.stdout.write(EOL)
  process.stdout.write('Append the completion script below to your configuration file to enable autocomplete.' + EOL)
  process.stdout.write('You need to source your configuration, or restart your shell, to load the changes.' + EOL)
  process.stdout.write(EOL)
  process.stdout.write(completion.script + EOL)
  exit(0)
}

async function installAutocompletion(command: string): Promise<void> {
  const completion = await getCompletionInfo(command, true)

  if (!completion.path) {
    throw Error('Null shell configuration path')
  }
  process.stdout.write('Your shell is: ' + completion.shell + EOL)
  process.stdout.write('Found configuration file path: ' + completion.path + EOL)
  process.stdout.write(EOL)
  process.stdout.write('Appending autocomplete script...' + EOL)
  await fs.appendFile(completion.path, EOL + completion.script + EOL)
  process.stdout.write('Installed autocomplete script.' + EOL)
  process.stdout.write(EOL)
  process.stdout.write('You need to source your configuration, or restart your shell, to load the changes.' + EOL)
  exit(0)
}

async function getCompletionInfo(command: string, strictPath: boolean): Promise<CompletionInfo> {
  const shellString = process.env.SHELL

  if (!shellString) {
    return handleNullShell()
  }
  const shell = detectShell(shellString)

  if (!shell) {
    return handleUnsupportedShell(shellString)
  }
  const possibleShellPaths = getShellPaths(shell)
  let path = null

  if (possibleShellPaths) {
    for (const possibleShellPath of possibleShellPaths) {
      if (await fileExists(possibleShellPath)) {
        path = possibleShellPath
        break
      }
    }
  }

  if (!path && strictPath && possibleShellPaths) {
    handleMissingPath(shell, possibleShellPaths)
  }
  const script = generateCompletion(command, shell)

  return { shell, path, possibleShellPaths, script }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path)

    return !stat.isDirectory()
  } catch {
    return false
  }
}

function handleNullShell(): never {
  process.stderr.write('Could not detect your shell.' + EOL)
  process.stderr.write('Set the SHELL environment variable and try again.' + EOL)
  exit(1)
}

function handleUnsupportedShell(shell: string): never {
  process.stderr.write('Your shell is: ' + shell + EOL)
  process.stderr.write('Only bash, zsh and fish are supported.' + EOL)
  exit(1)
}

function handleMissingPath(shell: string, paths: string[]): never {
  process.stderr.write('Your shell is: ' + shell + EOL)
  process.stderr.write('Expected configuration file at any of these locations: ' + EOL)
  for (const path of paths) {
    process.stderr.write('  ' + path + EOL)
  }
  exit(1)
}
