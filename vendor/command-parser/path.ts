import { promises as fs } from 'fs'

function parsePath(word: string): { dir: string; base: string } {
  const lastSlash = word.lastIndexOf('/')

  if (lastSlash === -1) {
    return { dir: '', base: word }
  }

  return { dir: word.slice(0, lastSlash), base: word.slice(lastSlash + 1) }
}

export async function completePath(word: string): Promise<string[]> {
  const { dir, base } = parsePath(word)
  const entries = await fs.readdir(dir || '.').catch(() => [] as string[])
  const matches = entries.filter(entry => entry.startsWith(base))
  const results: string[] = []
  for (const match of matches) {
    const path = (dir ? dir + '/' : '') + match
    const stats = await fs.stat(path)
    results.push(stats.isDirectory() ? path + '/' : path)
  }

  return results
}
