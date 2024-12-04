import { Command } from '@oclif/core'
import inquirer from 'inquirer'
import ora from 'ora'

import { getManifestValue,addManifestView } from '../../../utils/manifestUtils.js'
import { inAppFolderOrError, createSettings } from '../../../utils/appUtils.js'
import { delay } from '../../../utils/utils.js'

export default class AppsAddSettings extends Command {
  static override description = 'Add a new view'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    /**
     * Check if the command is being run inside the app folder
     */
    inAppFolderOrError();

    const viewport = 'settings'

    /**
     * Get existing views from the manifest
     */
    const existingViews = getManifestValue('ui_extension.views') || []
    const existingViewports = existingViews.map((view: { viewport: string }) => view.viewport)

    if (existingViewports.includes(viewport)) {
      this.error('Settings view has already been added.')
    }

    // Prompt the user for extension details
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'componentName',
        message: 'Enter the name of your component:',
        default: 'AppSettings',
        validate: (input: string) => (
          /^[A-Z][a-zA-Z0-9]*$/.test(input)
            ? true
            : 'Component name must be in PascalCase and start with an uppercase letter.'
        ),
      },
      {
        type: 'confirm',
        name: 'withExample',
        message: 'Generate a "Settings" example view?',
        default: false,
      },
    ])

    const { componentName, withExample } = answers

    const spinner = ora().start()

    /**
     * Create React component file
     */
    const componentPath = createSettings(componentName, withExample)
    spinner.text = `Component view created at ${componentPath}`

    await delay(1500)

    /**
     * Add view in app manifest
     */
    addManifestView(viewport, componentName)
    spinner.text = 'Manifest file updated'

    await delay(1200)

    spinner.succeed(`View "${componentName}" added successfully under "${viewport}".`);
  }
}
