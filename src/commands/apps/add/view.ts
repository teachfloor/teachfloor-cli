import { Command } from '@oclif/core'
import inquirer from 'inquirer'
import fs from 'fs'
import ora from 'ora'

import { getManifestPath, validateManifest } from '../../../utils/manifestUtils.js'
import { inAppFolderOrError, createView } from '../../../utils/appUtils.js'
import apiClient from '../../../utils/apiClient.js'

export default class AppsAddView extends Command {
  static override description = 'Add a new view'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  private async fetchViewports(): Promise<any> {
    const spinner = ora().start()

    try {
      const response = await apiClient.get('/viewports');
      spinner.succeed()
      return response.data.payload;
    } catch (error) {
      spinner.fail('Failed fetching viewports')

      if (error instanceof Error) {
        this.error(`Error fetching viewports: ${error.message}`);
      } else {
        this.error('An unknown error occurred');
      }
    }
  }

  public async run(): Promise<void> {
    /**
     * Check if the command is being run inside the app folder
     */
    inAppFolderOrError();

    // Fetch viewports from the API
    const viewports = await this.fetchViewports();

    if (viewports.length === 0) {
      this.error('No viewports available.');
    }

    // Prompt the user for extension details
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'viewport',
        message: 'Select the viewport for your view:',
        choices: viewports,
      },
      {
        type: 'input',
        name: 'componentName',
        message: 'Enter the name of your component:',
        default: (answers): string => {
          const viewport = answers.viewport

          const parts = viewport.includes('.') ? viewport.split('.').flatMap((part: string) => part.split('-')).slice(2) : [viewport];

          /**
           * Capitalize each part and join them
           */
          const formattedParts = parts.map((part: string) => {
            return part.charAt(0).toUpperCase() + part.slice(1);
          });

          return formattedParts.join('') + 'View';
        },
        validate: (input: string) => (
          /^[A-Z][a-zA-Z0-9]*$/.test(input)
            ? true
            : 'Component name must be in PascalCase and start with an uppercase letter.'
        ),
      },
      {
        type: 'confirm',
        name: 'gettingStartedExample',
        message: 'Generate a "Getting Started" example view?',
        default: false,
      },
    ]);

    const { viewport, componentName } = answers;

    // Create React component file
    const componentPath = createView(componentName, answers.gettingStartedExample);
    this.log(`Component view created at ${componentPath}`);

    // Update app manifest
    this.updateManifest(viewport, componentName);

    this.log(`View "${componentName}" added successfully under "${viewport}".`);
  }

  private updateManifest(viewport: string, componentName: string): void {
    const manifestPath = getManifestPath();

    validateManifest(manifestPath)

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    manifest.ui_extension = manifest.ui_extension || {};
    manifest.ui_extension.views = manifest.ui_extension.views || [];
    manifest.ui_extension.views.push({
      viewport,
      component: componentName,
    });

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    this.log('Manifest file updated.');
  }
}
