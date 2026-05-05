import PackageJson from '../../package.json'
import { CommandLog, VerbosityLevel } from '../command/root-command/command-log'
import { warningText } from '../utils/text'

const LATEST_RELEASE_URL = 'https://api.github.com/repos/ethersphere/swarm-cli/releases/latest'

export async function checkForUpdates() {
  const console = new CommandLog(VerbosityLevel.Normal)
  await fetch(LATEST_RELEASE_URL)
    .then(res => res.json())
    .then((data: { tag_name: string }) => {
      const latestVersion = data.tag_name.replace(/^v/, '')

      if (latestVersion !== PackageJson.version) {
        console.log(
          warningText(
            `A new version of swarm-cli is available: ${latestVersion}. You are using version ${PackageJson.version}. Please update to the latest version.`,
          ),
        )
      }
    })
}
