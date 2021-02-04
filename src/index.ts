import { cli, Utils } from 'furious-commander'
import { rootCommandClasses, optionParameters } from './config'
import PackageJson from '../package.json'

Utils.yargs.version(PackageJson.version)

cli({
  rootCommandClasses,
  optionParameters,
})
