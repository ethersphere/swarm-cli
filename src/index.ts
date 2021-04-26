import { cli } from 'furious-commander'
import { optionParameters, rootCommandClasses } from './config'
import { createPrinter } from './printer'

cli({
  rootCommandClasses,
  optionParameters,
  printer: createPrinter()
})
