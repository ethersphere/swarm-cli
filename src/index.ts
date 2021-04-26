import { cli } from 'furious-commander'
import { optionParameters, rootCommandClasses } from './config'

cli({
  rootCommandClasses,
  optionParameters,
})
