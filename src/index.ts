import { cli } from 'furious-commander'
import { application } from './application'
import { optionParameters, rootCommandClasses } from './config'
import { printer } from './printer'

cli({
  rootCommandClasses,
  optionParameters,
  printer,
  application,
})
