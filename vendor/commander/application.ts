import { Application as ParserApplication } from '../command-parser'

export interface Application extends ParserApplication {
  autocompletion?: 'fromOption' | 'fromCommand' | 'disabled'
}
