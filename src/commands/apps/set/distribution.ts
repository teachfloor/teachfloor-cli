import { Command } from '@oclif/core'
import inquirer from 'inquirer'
import ora from 'ora'

import { setManifestConfiguration } from '../../../utils/manifestUtils.js'
import { inAppFolderOrError } from '../../../utils/appUtils.js'
import { delay } from '../../../utils/utils.js'

export default class AppsSetDistribution extends Command {
  static override description = 'Set a configuration value within the app manifest'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    /**
     * Check if the command is being run inside the app folder
     */
    inAppFolderOrError()

    /**
     * Prompt the user to select the distribution type
     */
    const { distributionType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'distributionType',
        message: 'Select the distribution type:',
        choices: [
          'private',
          'public',
        ],
      }
    ])

    const spinner = ora().start()

    /**
     * Update app manifest
     */
    setManifestConfiguration('distribution_type', distributionType)
    spinner.text = 'Manifest file updated'

    await delay(1200)
    spinner.succeed(`Distribution type set to "${distributionType}" successfully.`)
  }
}
