import { cli } from 'furious-commander'
import { application } from './application'
import { optionParameters, rootCommandClasses } from './config'
import { printer } from './printer'
import { handleError } from './utils/error'

cli({
  rootCommandClasses,
  optionParameters,
  printer,
  application,
  errorHandler: (error: unknown) => handleError(error),
})
