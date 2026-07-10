#!/usr/bin/env node

import * as dns from 'dns'
import { cli } from 'furious-commander'
import { application } from './application'
import { optionParameters, rootCommandClasses } from './config'
import { printer } from './printer'
import { errorHandler } from './utils/error'

const setDefaultResultOrder = Reflect.get(dns, 'setDefaultResultOrder')

if (setDefaultResultOrder) {
  setDefaultResultOrder('ipv4first')
}

// fire-and-forget entry point: cli() reports its own failures via the errorHandler above
void cli({
  rootCommandClasses,
  optionParameters,
  printer,
  application,
  errorHandler,
})

process.stdout.on('error', error => {
  if (error.code !== 'EPIPE') {
    throw error
  }
})

process.stderr.on('error', error => {
  if (error.code !== 'EPIPE') {
    throw error
  }
})
