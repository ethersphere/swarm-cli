import { cli, Utils } from 'furious-commander'
import PackageJson from '../package.json'
import { optionParameters, rootCommandClasses } from './config'

Utils.yargs.alias('V', 'version')
Utils.yargs.alias('h', 'help')
Utils.yargs.version(PackageJson.version)

cli({
  rootCommandClasses,
  optionParameters,
})
