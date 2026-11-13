export function tokenize(
  string: string,
  offset = 0,
): { argv: string[]; quotes: false | string; token: string; opensNext: boolean } {
  const argv: string[] = []
  let quotes: false | string = false
  let token = ''
  let previous: string | null = null
  for (const character of string) {
    if (character === ' ' && token && !quotes) {
      argv.push(token)
      token = ''
    } else if (quotes && character === quotes && previous !== '\\') {
      quotes = false

      if (token === '') {
        argv.push('')
      }
    } else if (!quotes && ['"', "'"].includes(character) && previous !== '\\') {
      quotes = character
    } else if (character !== '\\' && (token || character !== ' ' || quotes)) {
      token += character
    }
    previous = character
  }

  if (token) {
    argv.push(token)
  }
  const opensNext = !token && !quotes && string.endsWith(' ')

  return { argv: argv.slice(offset), quotes, token, opensNext }
}
