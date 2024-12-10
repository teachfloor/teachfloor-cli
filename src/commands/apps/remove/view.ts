import { Command } from '@oclif/core'
import inquirer from 'inquirer'
import ora from 'ora'
import fs from 'fs'
import path from 'path'

import { getManifestValue, removeManifestView } from '../../../utils/manifestUtils.js'
import { inAppFolderOrError } from '../../../utils/appUtils.js'
import { delay } from '../../../utils/utils.js'

export default class AppsRemoveView extends Command {
  static override description = 'Remoew a new view'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    /**
     * Check if the command is being run inside the app folder
     */
    inAppFolderOrError()

    /**
     * Get existing views from the manifest
     */
    const existingViews = getManifestValue('ui_extension.views') || []

    if (existingViews.length === 0) {
      this.error('No views available to remove.')
    }

    // Prompt the user for details
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'viewToRemove',
        message: 'Select the view you want to remove:',
        choices: existingViews.map((view: { viewport: string; component: string }) => ({
          name: `${view.viewport}`,
          value: view,
        })),
      },
      {
        type: 'confirm',
        name: 'removeComponent',
        message: 'Do you want to delete the component file as well?',
        default: false,
      },
    ]);

    const { viewToRemove, removeComponent } = answers

    const spinner = ora().start()

    /**
     * Update app manifest
     */
    removeManifestView(viewToRemove.viewport)
    spinner.text = 'Manifest file updated'

    await delay(1200)

    if (removeComponent) {
      const componentPath = path.resolve(`src/views/${viewToRemove.component}.jsx`)
      if (fs.existsSync(componentPath)) {
        fs.unlinkSync(componentPath)
        spinner.text = `Component file "${componentPath}" deleted`
      } else {
        spinner.warn(`Component file "${componentPath}" not found`)
      }
    }

    await delay(1200)

    spinner.succeed(`View "${viewToRemove.viewport}" removed successfully.`)
  }
}
