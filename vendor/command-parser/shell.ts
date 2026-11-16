import { homedir } from 'os'
import { join } from 'path'

export type Shell = 'fish' | 'bash' | 'zsh'

const BASH_ZSH_TEMPLATE = `if type compdef &>/dev/null; then
    _$1() {
        local IFS=$'\\n'
        compadd -Q -S '' -- \`$2 --compzsh --compgen "\${BUFFER}"\`
    }
    compdef _$1 $2
elif type complete &>/dev/null; then
    _$1() {
        local IFS=$'\\n'
        local cur prev nb_colon
        _get_comp_words_by_ref -n : cur prev
        nb_colon=$(grep -o ":" <<< "$COMP_LINE" | wc -l)
        COMPREPLY=( $(compgen -W '$($2 --compbash --compgen "\${COMP_LINE}")' -- "$cur") )
        __ltrim_colon_completions "$cur"
    }
    complete -o nospace -F _$1 $2
fi`

const FISH_TEMPLATE = `function _$1
    $2 --compfish --compgen (commandline -pb)
end
complete -f -c $2 -a '(_$1)'`

export function generateCompletion(command: string, shell: Shell): string | null {
  const name = command.replace(/-/g, '_')

  if (shell === 'fish') {
    return FISH_TEMPLATE.replace(/\$1/g, name).replace(/\$2/g, command)
  }

  if (shell === 'zsh' || shell === 'bash') {
    return BASH_ZSH_TEMPLATE.replace(/\$1/g, name).replace(/\$2/g, command)
  }

  return null
}

export function detectShell(shellString: string): Shell | null {
  if (shellString.includes('fish')) {
    return 'fish'
  }

  if (shellString.includes('zsh')) {
    return 'zsh'
  }

  if (shellString.includes('bash')) {
    return 'bash'
  }

  return null
}

export function getShellPaths(shell: Shell): string[] | null {
  if (shell === 'fish') {
    return [join(homedir(), '.config/fish/config.fish')]
  }

  if (shell === 'zsh') {
    return [join(homedir(), '.zshrc')]
  }

  if (shell === 'bash') {
    return [join(homedir(), '.bashrc'), join(homedir(), '.bash_profile')]
  }

  return null
}
