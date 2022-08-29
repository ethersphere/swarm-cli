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

cli({
  rootCommandClasses,
  optionParameters,
  printer,
  application,
  errorHandler,
})
