/* eslint-disable no-console */
import { Printer as ParserPrinter } from '../command-parser'

export interface Printer extends ParserPrinter {
  getGenericErrorMessage(): string
}

export function createDefaultPrinter(): Printer {
  return {
    print: text => console.log(text),
    printError: text => console.error(text),
    printHeading: text => console.log(text),
    formatDim: text => text,
    formatImportant: text => text,
    getGenericErrorMessage: () => 'Failed to run command!',
  }
}
