/** Prints horizontal line */
export function divider(char = '-'): void {
  console.log(char.repeat(process.stdout.columns))
}
