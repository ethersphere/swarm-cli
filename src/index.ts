import dns from 'dns'
import { cli } from 'furious-commander'
import { application } from './application'
import { optionParameters, rootCommandClasses } from './config'
import { printer } from './printer'
import { errorHandler } from './utils/error'

dns.setDefaultResultOrder('ipv4first')

cli({
  rootCommandClasses,
  optionParameters,
  printer,
  application,
  errorHandler,
})
