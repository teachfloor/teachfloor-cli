import { Command } from '@oclif/core'
import inquirer from 'inquirer'
import path from 'path'
import fs from 'fs'
import ora from 'ora'

import { getManifestValue, addManifestView } from '../../../utils/manifestUtils.js'
import { inAppFolderOrError, createView } from '../../../utils/appUtils.js'
import { delay } from '../../../utils/utils.js'
import apiClient from '../../../utils/apiClient.js'

export default class AppsAddView extends Command {
  static override description = 'Add a new view'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  private async fetchViewports(): Promise<any> {
    const spinner = ora().start()

    try {
      const response = await apiClient.get('/apps/available-viewports')
      spinner.succeed()
      return response.data.payload
    } catch (error) {
      spinner.fail('Failed fetching viewports')

      if (error instanceof Error) {
        this.error(`Error fetching viewports: ${error.message}`)
      } else {
        this.error('An unknown error occurred')
      }
    }
  }

  public async run(): Promise<void> {
    /**
     * Check if the command is being run inside the app folder
     */
    inAppFolderOrError()

    // Fetch viewports from the API
    const viewports = await this.fetchViewports()

    if (viewports.length === 0) {
      this.error('No viewports available.')
    }

    /**
     * Get existing views from the manifest
     */
    const existingViews = getManifestValue('ui_extension.views') || []
    const existingViewports = existingViews.map((view: { viewport: string }) => view.viewport)

    /**
     * Filter out already added viewports from the list of choices
     */
    const availableViewports = viewports.filter(
      (viewport: string) => !existingViewports.includes(viewport)
    )

    if (availableViewports.length === 0) {
      this.error('All viewports have already been added.')
    }

    // Prompt the user for extension details
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'viewport',
        message: 'Select the viewport for your view:',
        choices: availableViewports,
      },
      {
        type: 'input',
        name: 'componentName',
        message: 'Enter the name of your component:',
        default: (answers): string => {
          const viewport = answers.viewport

          const parts = viewport.includes('.') ? viewport.split('.').flatMap((part: string) => part.split('-')).slice(2) : [viewport]

          /**
           * Capitalize each part and join them
           */
          const formattedParts = parts.map((part: string) => {
            return part.charAt(0).toUpperCase() + part.slice(1)
          })

          return formattedParts.join('') + 'View'
        },
        validate: (input: string) => (
          /^[A-Z][a-zA-Z0-9]*$/.test(input)
            ? true
            : 'Component name must be in PascalCase and start with an uppercase letter.'
        ),
      },
      {
        type: 'confirm',
        name: 'withExample',
        message: 'Generate a "Getting Started" example view?',
        default: false,
      },
    ]);

    const { viewport, componentName } = answers

    /**
     * Does the component already exist?
     */
    const componentExists = fs.existsSync(path.resolve(`src/views/${componentName}.jsx`))

    /**
     * Store a flag for later
     */
    let createComponent = true

    /**
     * If the component file already exist, ask user
     * if he wants to overwrite it
     */
    if (componentExists) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `The component file "${componentName}.jsx" already exists. Do you want to overwrite it?`,
          default: false,
        },
      ])

      if (!overwrite) {
        createComponent = false
      }
    }

    const spinner = ora().start()

    /**
     * Create React component file
     */
    if (createComponent) {
      const componentPath = createView(componentName, answers.withExample)
      spinner.text = `Component view created at ${componentPath}`
    }

    await delay(1500)

    /**
     * Update app manifest
     */
    addManifestView(viewport, componentName)
    spinner.text = 'Manifest file updated'

    await delay(1200)

    spinner.succeed(`View "${componentName}" added successfully under "${viewport}".`)
  }
}
